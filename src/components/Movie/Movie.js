import React, { Component } from 'react';
import './Movie.css';
import Header from '../Header/Header';
import Search from '../Search/Search';
import MovieInfo from '../MovieInfo/MovieInfo';
import Loader from '../Loader/Loader';
import axios from 'axios';

const key = '18195450fabc62a70a30dbc0d43118e1';

class Movie extends Component {
  state = {
    movie: {}
  };

  getMovie = () => {
    const id = window.location.pathname.substring(7);
    axios
      .get(
        'https://api.themoviedb.org/3/movie/' +
          id +
          '?api_key=' +
          key +
          '&append_to_response=credits,videos,similar'
      )
      .then(res => {
        const movie = res.data;
        this.setState({ movie });
      });
  };

  componentDidMount() {
    this.getMovie();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.movie !== this.state.movie) {
      this.getMovie();
    }
  }

  componentWillUnmount() {
    this.setState({ movie: {} });
    console.log('unmount');
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state);
  }

  pageChange = () => {
    this.setState({ movie: {} });
  };

  render() {
    return (
      <div className='moviePage'>
        <Header />
        <Search />
        {Object.keys(this.state.movie).length ? (
          <MovieInfo pageChange={this.pageChange} movie={this.state.movie} />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default Movie;