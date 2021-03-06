const mongoose = require('mongoose');
const User = require('../models/user');
const Favorite = require('../models/favorite');
const Watchlist = require('../models/watchlist');
const Rating = require('../models/rating');

exports.postFavorite = (req, res, next) => {
  const { movie, user, favorite } = req.body;
  Favorite.findOne({ tmdbId: movie.id }).then(foundedMovie => {
    console.log(foundedMovie);
    if (!foundedMovie) {
      const newFavorite = new Favorite({
        tmdbId: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path,
        favoritedUsers: [mongoose.Types.ObjectId(user._id)]
      });
      // console.log(
      //   newFavorite.favoritedUsers[0],
      //   typeof newFavorite.favoritedUsers[0]
      // );
      newFavorite
        .save()
        .then(favoriteMovie => {
          User.findById({ _id: user._id }).then(user => {
            console.log(favoriteMovie._id, typeof favoriteMovie._id);
            user.favoriteMovies.list.push(favoriteMovie._id.toString());
            user.favoriteMovies.tmdbId.push(favoriteMovie.tmdbId);
            console.log(user);
            user.save().then(user => {
              res.status(201).json({ message: 'Changed to favorite' });
            });
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else {
      let users = foundedMovie.favoritedUsers.slice();
      const userId = user._id;
      if (favorite) {
        users.push(userId);
      } else {
        users = users.filter(userIndex => userIndex.toString() !== userId);
      }
      foundedMovie.favoritedUsers = users;
      foundedMovie
        .save()
        .then(favoriteMovie => {
          User.findById({ _id: user._id }).then(user => {
            let { favoriteMovies } = user;
            const favoriteMovieId = favoriteMovie._id;
            const favoriteMovieTmdbId = favoriteMovie.tmdbId;
            if (favorite) {
              favoriteMovies.list.push(favoriteMovieId);
              favoriteMovies.tmdbId.push(favoriteMovieTmdbId);
            } else {
              favoriteMovies.list = favoriteMovies.list.filter(
                movieIndex => !favoriteMovieId.equals(movieIndex)
              );
              favoriteMovies.tmdbId = favoriteMovies.tmdbId.filter(
                movieIndex => movieIndex !== favoriteMovieTmdbId
              );
            }
            user.favoriteMovies = favoriteMovies;
            user.save().then(user => {
              const message = favorite
                ? 'Changed to favorite'
                : 'Removed from favorite';
              res.status(201).json({ message });
            });
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  });
};

exports.postWatchlist = (req, res, next) => {
  const { movie, user, watchlist } = req.body;
  Watchlist.findOne({ tmdbId: movie.id }).then(foundedMovie => {
    if (!foundedMovie) {
      const newWatchlist = new Watchlist({
        tmdbId: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path,
        watchlistUsers: [user._id]
      });
      newWatchlist
        .save()
        .then(watchlistMovie => {
          User.findById({ _id: user._id }).then(user => {
            user.watchlistMovies.list.push(watchlistMovie._id);
            user.watchlistMovies.tmdbId.push(watchlistMovie.tmdbId);
            user.save().then(user => {
              res.status(201).json({ message: 'Added to watchlist' });
            });
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    } else {
      let users = foundedMovie.watchlistUsers.slice();
      const userId = user._id;
      if (watchlist) {
        users.push(userId);
      } else {
        users = users.filter(userIndex => userIndex.toString() !== userId);
      }
      foundedMovie.watchlistUsers = users;
      foundedMovie
        .save()
        .then(watchlistMovie => {
          User.findById({ _id: user._id }).then(user => {
            let { watchlistMovies } = user;
            const watchlistMovieId = watchlistMovie._id;
            const watchlistMovieTmdbId = watchlistMovie.tmdbId;
            if (watchlist) {
              watchlistMovies.list.push(watchlistMovieId);
              watchlistMovies.tmdbId.push(watchlistMovieTmdbId);
            } else {
              watchlistMovies.list = watchlistMovies.list.filter(
                movieIndex => !watchlistMovieId.equals(movieIndex)
              );
              watchlistMovies.tmdbId = watchlistMovies.tmdbId.filter(
                movieIndex => movieIndex !== watchlistMovieTmdbId
              );
            }
            user.watchlistMovies = watchlistMovies;
            user.save().then(user => {
              const message = favorite
                ? 'Added to watchlist'
                : 'Removed from watchlist';
              res.status(201).json({ message });
            });
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  });
};

exports.postRating = (req, res, next) => {
  const { movie, user, rating } = req.body;
  Rating.findOne({ tmdbId: movie.id })
    .then(foundedMovie => {
      if (!foundedMovie) {
        const newRating = new Rating({
          tmdbId: movie.id,
          title: movie.title,
          ratings: [
            {
              userId: user._id,
              rating
            }
          ]
        });
        newRating
          .save()
          .then(ratedMovie => {
            User.findOne({ _id: user._id }).then(user => {
              user.ratedMovies = [
                {
                  tmdbId: ratedMovie.tmdbId,
                  rating
                }
              ];
              user.save().then(user => {
                res.status(201).json({ message: `New rating is ${rating}` });
              });
            });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        const userIndex = foundedMovie.ratings.findIndex(movie => {
          return movie.userId === user._id;
        });
        if (userIndex < 0) {
          foundedMovie.ratings.push({ userId: user._id, rating });
        } else {
          foundedMovie.ratings[userIndex].rating = rating;
        }
        foundedMovie.save().then(ratedMovie => {
          User.findOne({ _id: user._id }).then(user => {
            const movieIndex = user.ratedMovies.findIndex(
              movie => ratedMovie.tmdbId === movie.tmdbId
            );
            console.log(movieIndex, rating);
            if (movieIndex < 0) {
              user.ratedMovies.push({ tmdbId: ratedMovie.tmdbId, rating });
            } else {
              user.ratedMovies[movieIndex].rating = rating;
            }
            user.save().then(user => {
              res.status(201).json({ message: `New rating is ${rating}` });
            });
          });
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.favorite = (req, res, next) => {
  const username = req.params.username;
  User.findOne({ username: username })
    .populate('favoriteMovies.list')
    .exec((err, movies) => {
      res.status(201).json({ favoriteMovies: movies.favoriteMovies });
    });
};

exports.watchlist = (req, res, next) => {
  const username = req.params.username;
  User.findOne({ username: username })
    .populate('watchlistMovies.list')
    .exec((err, movies) => {
      res.status(201).json({ watchlistMovies: movies.watchlistMovies });
    });
};

exports.totalRating = (req, res, next) => {
  const tmdbId = req.body.tmdbId;
  Rating.findOne({ tmdbId })
    .then(ratedMovies => {
      const sumRating = ratedMovies.ratings.reduce(
        (acc, val) => acc + val.rating,
        0
      );
      return sumRating / ratedMovies.ratings.length;
    })
    .then(totalRating => {
      res.status(201).json({ totalRating });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
