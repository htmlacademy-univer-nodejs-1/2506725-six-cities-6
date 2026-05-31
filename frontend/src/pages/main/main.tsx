import { useEffect } from 'react';

import CardList from '../../components/card-list/card-list';
import CitiesList from '../../components/cities-list/cities-list';
import { useAppDispatch } from '../../hooks';
import { fetchOffers } from '../../store/action';

const Main = (): JSX.Element => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  return (
    <main className="page__main page__main--index">
      <h1 className="visually-hidden">Cities</h1>
      <div className="tabs">
        <section className="locations container">
          <CitiesList />
        </section>
      </div>
      <div className="cities">
        <CardList />
      </div>
    </main>
  );
};

export default Main;
