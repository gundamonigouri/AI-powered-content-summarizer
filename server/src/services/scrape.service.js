import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppError } from '../utils/apiResponse.js';
import { cleanText } from '../utils/textCleaner.js';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
]);

const isYouTubeUrl = (parsedUrl) => {
  return YOUTUBE_HOSTS.has(parsedUrl.hostname.toLowerCase());
};

const getYouTubeVideoId = (parsedUrl) => {
  const host = parsedUrl.hostname.toLowerCase();
  if (host === 'youtu.be') {
    return parsedUrl.pathname.split('/').filter(Boolean)[0] || null;
  }

  if (parsedUrl.pathname === '/watch') {
    return parsedUrl.searchParams.get('v');
  }

  const match = parsedUrl.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/);
  return match?.[1] || null;
};

const extractPageDescription = ($) => {
  return (
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="og:description"]').attr('content') ||
    $('meta[itemprop="description"]').attr('content') ||
    ''
  );
};

const scrapeWebpage = async (url) => {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ContentSummarizerBot/1.0; +https://github.com/content-summarizer)',
      Accept: 'text/html,application/xhtml+xml',
    },
    maxRedirects: 5,
  });

  const contentType = response.headers['content-type'] || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new AppError('URL does not point to an HTML webpage', 400);
  }

  const $ = cheerio.load(response.data);
  $('script, style, nav, footer, iframe, noscript').remove();

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="title"]').attr('content') ||
    $('title').text().trim() ||
    url;

  const description = extractPageDescription($);
  const content = cleanText(
    [
      $('article').text(),
      $('main').text(),
      $('[role="main"]').text(),
      $('body').text(),
      description,
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (!content || content.length < 50) {
    throw new AppError('Could not extract enough text from the webpage', 400);
  }

  return { title, content, url };
};

const extractPlayerResponse = (html) => {
  const marker = html.match(/ytInitialPlayerResponse\s*=/);
  if (!marker || marker.index === undefined) return null;

  const jsonStart = html.indexOf('{', marker.index);
  if (jsonStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = jsonStart; i < html.length; i += 1) {
    const char = html[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return JSON.parse(html.slice(jsonStart, i + 1));
    }
  }

  return null;
};

const scrapeYouTubeTranscript = async (url, parsedUrl) => {
  const videoId = getYouTubeVideoId(parsedUrl);
  if (!videoId) {
    throw new AppError('Could not read the YouTube video id from the URL', 400);
  }

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const response = await axios.get(watchUrl, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    maxRedirects: 5,
  });

  const playerResponse = extractPlayerResponse(response.data);
  const videoDetails = playerResponse?.videoDetails || {};
  const captionTracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

  if (captionTracks.length === 0) {
    throw new AppError(
      'This YouTube video does not expose captions/transcripts that can be summarized. Try a video with captions enabled.',
      400
    );
  }

  const transcriptTrack =
    captionTracks.find((track) => track.languageCode?.toLowerCase().startsWith('en')) ||
    captionTracks[0];

  const transcriptResponse = await axios.get(transcriptTrack.baseUrl, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      Accept: 'text/xml,application/xml,text/plain',
    },
  });

  const $ = cheerio.load(transcriptResponse.data, { xmlMode: true });
  const transcript = cleanText(
    $('text')
      .map((_, node) => $(node).text())
      .get()
      .join(' ')
  );

  if (!transcript || transcript.length < 50) {
    throw new AppError('Could not extract enough transcript text from the YouTube video', 400);
  }

  return {
    title: videoDetails.title || `YouTube video ${videoId}`,
    content: transcript,
    url,
  };
};

export const scrapeUrl = async (url) => {
  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new AppError('URL must use http or https protocol', 400);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid URL format', 400);
  }

  if (isYouTubeUrl(parsed)) {
    try {
      return await scrapeYouTubeTranscript(url, parsed);
    } catch (error) {
      if (error instanceof AppError && error.code === 'ENOTFOUND') {
        throw new AppError('YouTube could not be reached. Check the URL.', 400);
      }
      if (error instanceof AppError && error.code === 'ECONNABORTED') {
        throw new AppError('Request timed out while fetching the YouTube transcript', 408);
      }
      if (error instanceof AppError && /captions|transcript|extract/i.test(error.message)) {
        return await scrapeWebpage(url);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to fetch YouTube transcript', 400);
    }
  }

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ContentSummarizerBot/1.0; +https://github.com/content-summarizer)',
        Accept: 'text/html,application/xhtml+xml',
      },
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new AppError('URL does not point to an HTML webpage', 400);
    }

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, iframe, noscript').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || url;
    const text = cleanText(
      $('article').text() ||
        $('main').text() ||
        $('[role="main"]').text() ||
        $('body').text()
    );

    if (!text || text.length < 50) {
      throw new AppError('Could not extract enough text from the webpage', 400);
    }

    return { title, content: text, url };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.code === 'ENOTFOUND') {
      throw new AppError('Website not found. Check the URL.', 400);
    }
    if (error.code === 'ECONNABORTED') {
      throw new AppError('Request timed out while fetching the URL', 408);
    }
    throw new AppError(error.message || 'Failed to fetch URL content', 400);
  }
};
