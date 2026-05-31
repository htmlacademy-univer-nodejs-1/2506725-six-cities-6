import { createSlice } from '@reduxjs/toolkit';

import type { SiteData } from '../../types/state';
import type { Offer } from '../../types/types';
import { StoreSlice, SubmitStatus } from '../../const';
import { fetchOffers, fetchOffer, fetchPremiumOffers, fetchComments, postComment, postFavorite, fetchFavoriteOffers, postOffer, editOffer, deleteOffer, loginUser, logoutUser, fetchUserStatus } from '../action';

const initialState: SiteData = {
  offers: [],
  isOffersLoading: false,
  offer: null,
  isOfferLoading: false,
  favoriteOffers: [],
  isFavoriteOffersLoading: false,
  premiumOffers: [],
  comments: [],
  commentStatus: SubmitStatus.Still,
};

const updateFavoriteFlag = (offer: Offer, isFavorite: boolean): Offer =>
  offer.isFavorite === isFavorite ? offer : { ...offer, isFavorite };

const resetFavoriteFlags = (state: SiteData): void => {
  state.favoriteOffers = [];
  state.offers = state.offers.map((offer) => updateFavoriteFlag(offer, false));
  state.premiumOffers = state.premiumOffers.map((offer) => updateFavoriteFlag(offer, false));

  if (state.offer) {
    state.offer = updateFavoriteFlag(state.offer, false);
  }
};

const syncFavoriteFlags = (state: SiteData): void => {
  const favoriteIds = new Set(state.favoriteOffers.map((offer) => offer.id));

  state.offers = state.offers.map((offer) =>
    updateFavoriteFlag(offer, favoriteIds.has(offer.id))
  );
  state.premiumOffers = state.premiumOffers.map((offer) =>
    updateFavoriteFlag(offer, favoriteIds.has(offer.id))
  );

  if (state.offer) {
    state.offer = updateFavoriteFlag(state.offer, favoriteIds.has(state.offer.id));
  }
};

export const siteData = createSlice({
  name: StoreSlice.SiteData,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.isOffersLoading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
        state.isOffersLoading = false;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.isOffersLoading = false;
      })
      .addCase(fetchFavoriteOffers.pending, (state) => {
        state.isFavoriteOffersLoading = true;
      })
      .addCase(fetchFavoriteOffers.fulfilled, (state, action) => {
        state.favoriteOffers = action.payload;
        syncFavoriteFlags(state);
        state.isFavoriteOffersLoading = false;
      })
      .addCase(fetchFavoriteOffers.rejected, (state) => {
        state.isFavoriteOffersLoading = false;
      })
      .addCase(fetchOffer.pending, (state) => {
        state.isOfferLoading = true;
      })
      .addCase(fetchOffer.fulfilled, (state, action) => {
        state.offer = action.payload;
        state.isOfferLoading = false;
      })
      .addCase(fetchOffer.rejected, (state) => {
        state.isOfferLoading = false;
      })
      .addCase(fetchPremiumOffers.fulfilled, (state, action) => {
        state.premiumOffers = action.payload;
        syncFavoriteFlags(state);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(postOffer.fulfilled, (state, action) => {
        state.offers = [action.payload, ...state.offers];
        state.offer = action.payload;
      })
      .addCase(editOffer.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        state.offers = state.offers.map((offer) => offer.id === updatedOffer.id ? updatedOffer : offer);
        state.favoriteOffers = state.favoriteOffers.map((offer) => offer.id === updatedOffer.id ? updatedOffer : offer);
        state.offer = updatedOffer;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((offer) => offer.id !== action.payload);
        state.favoriteOffers = state.favoriteOffers.filter((offer) => offer.id !== action.payload);
        state.offer = null;
      })
      .addCase(postComment.pending, (state) => {
        state.commentStatus = SubmitStatus.Pending;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments = [action.payload, ...state.comments];
        state.commentStatus = SubmitStatus.Fullfilled;
      })
      .addCase(postComment.rejected, (state) => {
        state.commentStatus = SubmitStatus.Rejected;
      })
      .addCase(postFavorite.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const isFavorite = Boolean(status);

        state.offers = state.offers.map((offer) => offer.id === id ? {...offer, isFavorite} : offer);

        if (state.offer && state.offer.id === id) {
          state.offer = {...state.offer, isFavorite};
        }

        if (isFavorite) {
          const favoriteOffer = state.offer ?? state.offers.find((offer) => offer.id === id);
          if (favoriteOffer && !state.favoriteOffers.some((offer) => offer.id === id)) {
            state.favoriteOffers = state.favoriteOffers.concat({...favoriteOffer, isFavorite});
          }
        } else {
          state.favoriteOffers = state.favoriteOffers.filter((favoriteOffer) => favoriteOffer.id !== id);
        }
      })
      .addCase(loginUser.fulfilled, (state) => {
        resetFavoriteFlags(state);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        resetFavoriteFlags(state);
      })
      .addCase(fetchUserStatus.rejected, (state) => {
        resetFavoriteFlags(state);
      });
  }
});
