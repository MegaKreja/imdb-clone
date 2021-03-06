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
    movie: {},
    user: {},
    favorite: false,
    watchlist: false,
    rating: 0,
    totalRating: 0,
    review: '',
    reviews: [],
    editing: {
      reviewIndex: null,
      openEdit: false
    },
    editedReview: '',
    likedReviews: []
  };

  componentDidMount() {
    this.getMovie();
    const jwt = localStorage.getItem('token');
    if (jwt) {
      this.isUserLoggedIn(jwt);
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('will receive props');
    this.setState({
      movie: {},
      // user: {},
      favorite: false,
      watchlist: false,
      rating: 0,
      totalRating: 0,
      review: '',
      reviews: [],
      editing: {},
      editedReview: ''
    });
    if (nextProps.movie !== this.state.movie) {
      this.getMovie();
      const jwt = localStorage.getItem('token');
      if (jwt) {
        this.isUserLoggedIn(jwt);
      }
    }
  }

  componentWillUnmount() {
    this.setState({
      movie: {},
      // user: {},
      favorite: false,
      watchlist: false,
      rating: 0,
      totalRating: 0,
      review: '',
      reviews: [],
      editing: {},
      editedReview: ''
    });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state);
  }

  isUserLoggedIn = jwt => {
    axios
      .get('http://localhost:8000/auth/get-user', {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => {
        if (!res.data.expired) {
          const isFavorite = res.data.favoriteMovies.tmdbId.find(
            movie => movie === this.state.movie.id
          );
          const inWatchlist = res.data.watchlistMovies.tmdbId.find(
            movie => movie === this.state.movie.id
          );
          const isRated = res.data.ratedMovies.find(
            movie => movie.tmdbId === this.state.movie.id
          );
          const rating = isRated ? isRated.rating : 0;
          this.setState(
            {
              user: res.data,
              favorite: isFavorite,
              watchlist: inWatchlist,
              rating: rating
            },
            () => {
              this.getTotalRating(this.state.rating);
            }
          );
          console.log(res.data);
        }
      })
      .catch(err => console.log(err));
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
        this.getReviews();
      });
  };

  getTotalRating = rating => {
    const tmdbId = this.state.movie.id;
    if (rating === 0) {
      return;
    }
    axios
      .post('http://localhost:8000/lists/total-rating', { tmdbId })
      .then(res => {
        const { totalRating } = res.data;
        this.setState({ totalRating });
      })
      .catch(err => console.log(err));
  };

  changeToFavorite = () => {
    const { movie, user } = this.state;
    this.setState(
      prevState => ({ favorite: !prevState.favorite }),
      () => {
        axios
          .post('http://localhost:8000/lists/favorite', {
            movie,
            user,
            favorite: this.state.favorite
          })
          .then(res => {
            console.log(res.data);
          })
          .catch(err => console.log(err));
      }
    );
  };

  putToWatchlist = () => {
    const { movie, user } = this.state;
    this.setState(
      prevState => ({ watchlist: !prevState.watchlist }),
      () => {
        axios
          .post('http://localhost:8000/lists/watchlist', {
            movie,
            user,
            watchlist: this.state.watchlist
          })
          .then(res => {
            console.log(res.data);
          })
          .catch(err => console.log(err));
      }
    );
  };

  changeRating = (event, { rating }) => {
    console.log(rating);
    const { movie, user } = this.state;
    axios
      .post('http://localhost:8000/lists/rating', {
        movie,
        user,
        rating
      })
      .then(res => {
        console.log(res.data.rating);
      })
      .catch(err => console.log(err));
  };

  onChangeReview = review => {
    this.setState({ review });
  };

  onChangeEdit = editedReview => {
    this.setState({ editedReview });
  };

  addReview = () => {
    const { user, movie, review, reviews } = this.state;
    axios
      .post('http://localhost:8000/reviews/add', { user, movie, review })
      .then(res => {
        const { review } = res.data;
        reviews.push(review);
        console.log(reviews);
        this.setState({ review: '', reviews });
      })
      .catch(err => console.log(err));
  };

  getReviews = () => {
    const tmdbId = this.state.movie.id;
    axios
      .get('http://localhost:8000/reviews/' + tmdbId)
      .then(res => {
        console.log(res.data);
        const { reviews } = res.data;
        this.setState({ reviews });
      })
      .catch(() => {
        this.setState({ reviews: [] });
      });
  };

  openEditForm = (reviewIndex, editedReview) => {
    this.setState(prevState => {
      const openEdit =
        prevState.editing.reviewIndex === reviewIndex
          ? !prevState.editing.openEdit
          : true;
      return {
        editing: {
          ...prevState.editing,
          reviewIndex,
          openEdit
        },
        editedReview
      };
    });
  };

  editReview = () => {
    const { editedReview, movie, editing, reviews } = this.state;

    axios
      .post('http://localhost:8000/reviews/edit', {
        editedReview,
        tmdbId: movie.id,
        index: editing.reviewIndex
      })
      .then(res => {
        reviews[editing.reviewIndex].text = editedReview;
        this.setState({
          reviews,
          editedReview,
          editing: {
            reviewIndex: null,
            openEdit: false
          }
        });
      })
      .catch(err => console.log(err));
  };

  likeReview = index => {
    let { movie, reviews } = this.state;
    axios
      .post('http://localhost:8000/reviews/like', {
        username: this.state.user.username,
        tmdbId: movie.id,
        index
      })
      .then(res => {
        console.log(reviews);
        console.log(res.data.reviews);
        reviews[index] = res.data.reviews.reviews[index];
        console.log(reviews);
        this.setState({ reviews });
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className='moviePage'>
        <Header />
        <Search />
        {Object.keys(this.state.movie).length ? (
          <MovieInfo
            movie={this.state.movie}
            user={this.state.user}
            favorite={this.state.favorite}
            watchlist={this.state.watchlist}
            rating={this.state.rating}
            totalRating={this.state.totalRating}
            changeToFavorite={this.changeToFavorite}
            putToWatchlist={this.putToWatchlist}
            changeRating={this.changeRating}
            changeReview={this.onChangeReview}
            review={this.state.review}
            addReview={this.addReview}
            reviews={this.state.reviews}
            editing={this.state.editing}
            editedReview={this.state.editedReview}
            openEditForm={this.openEditForm}
            changeEdit={this.onChangeEdit}
            editReview={this.editReview}
            likeReview={this.likeReview}
          />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

export default Movie;
