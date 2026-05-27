import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  summarizeText,
  summarizeUrl,
  summarizeFile,
  getHistory,
  searchSummaries,
} from '../api/client';

export const fetchTextSummary = createAsyncThunk(
  'summary/text',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await summarizeText(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchUrlSummary = createAsyncThunk(
  'summary/url',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await summarizeUrl(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchFileSummary = createAsyncThunk(
  'summary/file',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await summarizeFile(formData);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'summary/history',
  async (limit, { rejectWithValue }) => {
    try {
      const res = await getHistory(limit);
      return res.data.items;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchSearch = createAsyncThunk(
  'summary/search',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await searchSummaries(payload);
      return res.data.results;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    current: null,
    history: [],
    searchResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
      state.error = null;
    },
    clearSearch: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchTextSummary.pending, pending)
      .addCase(fetchTextSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchTextSummary.rejected, rejected)
      .addCase(fetchUrlSummary.pending, pending)
      .addCase(fetchUrlSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchUrlSummary.rejected, rejected)
      .addCase(fetchFileSummary.pending, pending)
      .addCase(fetchFileSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchFileSummary.rejected, rejected)
      .addCase(fetchHistory.pending, pending)
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistory.rejected, rejected)
      .addCase(fetchSearch.pending, pending)
      .addCase(fetchSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearch.rejected, rejected);
  },
});

export const { clearCurrent, clearSearch } = summarySlice.actions;
export default summarySlice.reducer;
