/**
 * app.js
 *
 *
 */

// CONST
const searchFormUtil = {};
const twitchQuery = {
  base: 'https://api.twitch.tv/kraken/'
}
const twitchUi = {
  searchBtn: document.querySelector('.submitBtn'),
  searchInput: document.querySelector('.apiSearchQuery'),
  pages: 1
}
const searchButton = twitchUi.searchBtn
const searchQuery = twitchUi.searchInput
/********************** Search Utility Methods *********************/

/**
 * A helper method to support building the URL
 * based on input within the search form field.
 *
 * @param selector   The class selector for search form input field
 */

searchFormUtil.getFormValue = selector => {
  if (!selector) return
  return searchQuery.value
}

/**
 * Builds URL based on base URL, input within the search form field, api limit, stringified json, and client ID. Returns URL.

 */
searchFormUtil.buildSearchUrl = () => {
  const query = searchFormUtil.getFormValue('apiSearchQuery')
  const queryParams = 'search/streams?q='+query+'&limit=5&stringifyjsoncb&client_id=imsyx3x5l3ld754zt6wkzwntlqiwou'

  if (query) {
    return encodeURI(queryParams)
  } else {
    // twitchUi.displayError('Insert a query in the text field.')
    return false
  }
}

/********************** Twitch Query Methods *********************/
/******** Responsible for logic control of search query **********/
/**
 * Builds search query on behalf of user.
 */

 twitchQuery.search = () => {
  const url = twitchQuery.base + searchFormUtil.buildSearchUrl()
  const res = twitchQuery.updateHeaders(url)

  console.log(url)

  if (!searchFormUtil.buildSearchUrl()) return
  // if (!res) twitchUi.displayError('Cannot find results for your current search. Please try again.')
  twitchUi.pages = 1
 }
/**
 * Asynchronously updates CORS headers.
 */

twitchQuery.updateHeaders = url => {
    const header = document.head
    const script = document.createElement('script')
    script.setAttribute('src', url)
    header.appendChild(script)
    header.removeChild(script)
    return true
}


/********************** User Interface Methods *********************/

/*
* Enables searchButton to submit form field value
*/
searchButton.addEventListener('click', twitchQuery.search)
/**
 * A keydown handler for the query to support hitting enter
 *
 * @param event   The event for particular key attached
 */
searchQuery.addEventListener('keydown', event => {
  if (event.keyCode === 13) twitchQuery.search()
})


