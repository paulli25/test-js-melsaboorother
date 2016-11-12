import fetch from 'fetch-jsonp'
import moment from 'moment'

export function getPopularMovies () {
  return dispatch => {
    const fourStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=4'
    const fiveStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=5'
    const req1 = fetch(fourStarUrl)
    const req2 = fetch(fiveStarUrl)

    function _extract_year(releaseDate) {
        // TODO: check input first
        return releaseDate.substring(0,4)
    }

    function _order(a, b) {
        // most recent year first
        if (a.releaseYear > b.releaseYear) return -1;
        if (a.releaseYear < b.releaseYear) return 1;
        if (a.trackName > b.trackName) return 1;
        if (a.trackName < b.trackName) return -1;
        return 0
    }

    return Promise.all([req1, req2])
      .then(responses => responses.map(res => res.json()))
      .then(jsonPromises => Promise.all(jsonPromises))
      .then(jsonResponses => {
        //
        // jsonResponses contains the results of two API requests
        //

        //
        // 1. combine the results of these requests
        // 2. sort the results FIRST by year THEN by title (trackName)
        // 3. each movie object in the results needs a releaseYear attribute added
        //    this is used in src/components/movies-list.js line 26
        //

        jsonResponses[0].results.forEach(
            part => { part['releaseYear'] = _extract_year(part['releaseDate'])
        })
        jsonResponses[1].results.forEach(
            part => { part['releaseYear'] = _extract_year(part['releaseDate'])
        })

        const combinedResults = jsonResponses[0].results
            .concat(jsonResponses[1].results)
            .sort(_order)

        return dispatch({
          type: 'GET_MOVIES_SUCCESS',
          movies: combinedResults
        })
      })
  }
}


