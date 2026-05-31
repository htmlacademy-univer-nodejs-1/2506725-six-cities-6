import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type { UserAuth, User, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { adaptComment, adaptComments, adaptOffer, adaptOffers, adaptOfferToPayload, adaptRegisterToPayload } from '../adapters';
import { parseTokenPayload, Token, UserDirectory } from '../utils';

type Extra = {
  api: AxiosInstance;
  history: History;
}

type UserResponse = User & {
  avatar?: string;
  type?: string;
  token?: string;
};

const saveKnownUser = (user: UserResponse, id: string): void => {
  if (!id) {
    return;
  }

  UserDirectory.save({
    id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? user.avatar ?? 'img/avatar.svg',
    isPro: user.isPro ?? user.type === 'Pro',
  });
};

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get(ApiRoute.Offers);

    return adaptOffers(data);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get(ApiRoute.FavoriteOffers);

    return adaptOffers(data).map((offer) => ({
      ...offer,
      isFavorite: true,
    }));
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<Offer>(`${ApiRoute.Offers}/${id}`);

      return adaptOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<Offer, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post(ApiRoute.Offers, adaptOfferToPayload(newOffer));
    const offer = adaptOffer(data);
    history.push(`${AppRoute.Property}/${offer.id}`);

    return offer;
  });

export const editOffer = createAsyncThunk<Offer, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.patch(`${ApiRoute.Offers}/${offer.id}`, adaptOfferToPayload(offer));
    const updatedOffer = adaptOffer(data);
    history.push(`${AppRoute.Property}/${updatedOffer.id}`);

    return updatedOffer;
  });

export const deleteOffer = createAsyncThunk<string, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);

    return id;
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get(ApiRoute.PremiumOffers, {
      params: {
        city: cityName,
      },
    });

    return adaptOffers(data);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`);

    return adaptComments(data);
  });

export const fetchUserStatus = createAsyncThunk<Pick<User, 'email'> & { id: string }, undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;
    const token = Token.get();

    if (!token) {
      return Promise.reject();
    }

    try {
      const { data } = await api.get<UserResponse>(ApiRoute.Login);
      const payload = parseTokenPayload(token);
      const userId = payload?.id ?? '';

      saveKnownUser({
        ...data,
        name: data.name ?? payload?.name ?? data.email,
        email: data.email ?? payload?.email ?? '',
      }, userId);

      return {
        email: data.email,
        id: userId,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<Pick<User, 'email'> & { id: string }, UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<UserResponse>(ApiRoute.Login, { email, password });
    const token = data.token ?? '';
    const payload = parseTokenPayload(token);
    const userId = payload?.id ?? '';

    Token.save(token);
    saveKnownUser({
      ...data,
      name: data.name ?? payload?.name ?? email,
      email: data.email ?? payload?.email ?? email,
    }, userId);
    dispatch(fetchOffers());
    dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);

    return {
      email: data.email,
      id: userId,
    };
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra, dispatch }) => {
    const { api } = extra;
    await api.post(ApiRoute.Logout);

    Token.drop();
    dispatch(fetchOffers());
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async (newUser, { extra }) => {
    const { api, history } = extra;
    await api.post(ApiRoute.Register, adaptRegisterToPayload(newUser));
    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra, dispatch }) => {
    const { api } = extra;
    const { data } = await api.post(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`, {
      text: comment,
      rating,
      offerId: id,
    });

    dispatch(fetchOffer(id));
    dispatch(fetchOffers());

    return adaptComment(data);
  });

export const postFavorite = createAsyncThunk<FavoriteAuth, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      if (status) {
        await api.post(`${ApiRoute.Offers}/${id}${ApiRoute.Favorite}`);
      } else {
        await api.delete(`${ApiRoute.Offers}/${id}${ApiRoute.Favorite}`);
      }

      return { id, status };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });
