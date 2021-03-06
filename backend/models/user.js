const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  favoriteMovies: {
    list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite',
        required: true
      }
    ],
    tmdbId: [
      {
        type: Number,
        required: true
      }
    ]
  },
  watchlistMovies: {
    list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watchlist',
        required: true
      }
    ],
    tmdbId: [
      {
        type: Number,
        required: true
      }
    ]
  },
  ratedMovies: [
    {
      tmdbId: {
        type: Number
      },
      rating: {
        type: Number
      }
    }
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
