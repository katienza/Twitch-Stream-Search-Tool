/**
 * app.js
 *
 *
 */

// CONST
const searchFormUtil = {};
const twitchQuery = {
  base: 'https://api.twitch.tv/kraken/search/streams?query='
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
 * Builds URL based on base URL, input within the search form field,
 * api limit, stringified json, and client ID.
 * Returns URL.
 */
searchFormUtil.buildSearchUrl = () => {
  const query = searchFormUtil.getFormValue('apiSearchQuery')
  const queryParams = query+'&limit=5'+'&callback=stringifyjsoncb'+'&client_id=imsyx3x5l3ld754zt6wkzwntlqiwou'+'&api_version=5'

  if (!query || query.length <= 0) {
    twitchUi.hide('searchResultsView')
    twitchUi.hide('loadingPage')
    twitchUi.showErrorHandler('Insert a query at the top of the page.')
  } else {
    return encodeURI(queryParams)
  }
}


/********************** Twitch Query Methods *********************/
/******** Responsible for logic control of search query **********/

/*
* Enables searchButton to submit form field value
*/
searchButton.addEventListener('click', () => twitchQuery.find())

/**
 * A keydown handler for the query to support hitting enter
 *
 * @param event   The event for particular key attached
 */
searchQuery.addEventListener('keydown', event => {
  if (event.keyCode === 13) twitchQuery.find()
})

/**
 * Builds search query on behalf of user.
 */
 twitchQuery.find = () => {
  const url = twitchQuery.base + searchFormUtil.buildSearchUrl()
  const res = twitchQuery.updateHeaders(url)

  if (!searchFormUtil.buildSearchUrl()) return
  if (!res) twitchUi.showError('Cannot find results for your current search. Please try again.')
  twitchUi.pages = 1
 }

/**
 * Asynchronously updates CORS headers.
 */
twitchQuery.updateHeaders = url => {
    const script = document.createElement('script')

    script.setAttribute('src', url)

    document.head.appendChild(script)
    document.head.removeChild(script)

    return true
}

/**
 * Parses API req and transforms into JSON.
 * Passes JSON properties to UI method.
 *
 * @param res       Contains raw data from API request
 */
twitchQuery.handleResponses = res => {
  const data = JSON.parse(res)
  const totalFound = data._total
  const links = data._links
  const streams = data.streams
  const error = data.error

  if (totalFound > 0 && !error) {
    twitchUi.hide('errorHandler')
    twitchUi.hide('searchResultsView')
    twitchUi.transition('loadingPage')
    twitchUi.buildStreamsCount(totalFound)
    twitchUi.buildPagination(totalFound, links)
    twitchUi.buildPaginationFooter(totalFound, links)
    twitchUi.buildStreamsContent(streams)
  } else {
    twitchUi.hide('searchResultsView')
    twitchUi.hide('loadingPage')
    twitchUi.showErrorHandler('No results were found based on your query. Please try your search again.')
  }
}

function stringifyjsoncb(data) {
  twitchQuery.handleResponses(JSON.stringify(data))
}

/********************** User Interface Viewers & Pagination Methods *********************/


/**
 * Returns total stream count
 *
 * @param totalStreams    Receives value for number of streams
 *
 */
twitchUi.buildStreamsCount = totalStreams => {
  const streamsCount = document.getElementById('searchResultsTotal')

  streamsCount.innerHTML = 'Total results: ' + totalStreams
}

/**
 * Returns current/total page count
 * and next and previous pagination
 *
 * @param links     Receives next and prev values
 * @param totalStreams  Receives number of streams
 */
twitchUi.buildPagination = (totalStreams, links) => {
  const pageTurner = document.getElementById('searchResultsPages')
  let totalPages = Math.ceil(totalStreams / 5)
  let pageCount = twitchUi.pages
  let pagination = ""
  let prev = links.prev
  let next = links.next

  if (typeof prev !== 'undefined') {
    pagination += "<a id='prevButton' href='"+prev+"'>Previous</a>"
  }

  pagination += "<span id='pageCount'>"+" "+pageCount+"/"+totalPages+" "+"</span>"

  if (typeof next !== 'undefined' && (pageCount < totalPages)) {
    pagination += "<a id='nextButton' href='"+next+"'>Next</a>"
  }

  pageTurner.innerHTML = pagination

  twitchUi.initPageClick('nextButton')
  twitchUi.initPageClick('prevButton')

  document.getElementById('streamsContainer').innerHTML = ""
}

/**
 * Returns current/total page count
 * and next and previous pagination for footer
 *
 * @param links     Receives next and prev values
 * @param totalStreams  Receives number of streams
 */
twitchUi.buildPaginationFooter = (totalStreams, links) => {
  const pageTurnerBottom = document.getElementById('footer')
  let totalPages = Math.ceil(totalStreams / 5)
  let pageCount = twitchUi.pages
  let bottomPagination = ""
  let prev = links.prev
  let next = links.next

  if (typeof prev !== 'undefined') {
    bottomPagination += "<a id='prevBottomButton' href="+prev+">Previous</a>"
  }

  bottomPagination += "<span id='pageBottomCount'>"+" "+pageCount+"/"+totalPages+" "+"</span>"

  if (typeof next !== 'undefined' && (pageCount < totalPages)) {
    bottomPagination += "<a id='nextBottomButton' href='"+next+"'>Next</a>"
  }

  pageTurnerBottom.innerHTML = bottomPagination

  twitchUi.initPageClick('prevBottomButton')
  twitchUi.initPageClick('nextBottomButton')

  document.getElementById('streamsContainer').innerHTML = ""
}

/* Builds content for stream
 *
 * @param streamsList     Receives array list of streams
 *
 */
twitchUi.buildStreamsContent = streamsList => {
  for (let props in streamsList) {
    if (streamsList.hasOwnProperty(props)) {
      twitchUi.showStreamData(streamsList[props])
    }
  }
  setTimeout(() => {
    twitchUi.hide('loadingPage')
    twitchUi.transition('searchResultsView')
  }, 1000)
}

/**
 * Enables next and prev button and submits pagination
 *
 * @param btnID    Receives selector id for next or prev button
 */
twitchUi.initPageClick = btnID => {
  let btn = document.getElementById(btnID)

  if (btn) {
    btn.addEventListener('click', event => {
      event.preventDefault()
      twitchUi.pageClick(btnID)
    })
  }
}

/**
 * Increments / decrements current page
 *
 * @param btnID    Receives selector id for next or prev button
 */
twitchUi.pageClick = btnID => {
  let pageAPIUrl = document.getElementById(btnID).getAttribute('href')
  let res = twitchQuery.updateHeaders(pageAPIUrl+"&callback=stringifyjsoncb"+"&client_id=imsyx3x5l3ld754zt6wkzwntlqiwou"+"&api_version=5")


  if (res && (btnID === 'prevButton' || btnID === 'prevBottomButton')) {
    twitchUi.pages = twitchUi.pages - 1
  } else if (res && (btnID === 'nextButton' || btnID === 'nextBottomButton')) {
    twitchUi.pages = twitchUi.pages + 1
  } else {
    twitchUi.showErrorHandler('An error has occurred. Please try again.')
  }
}


/********************** User Interface Stream Display Methods *********************/


twitchUi.createUiElement = (element, attributes) => {
  const ele = document.createElement(element)

  for (let prop in attributes) {
    if (attributes.hasOwnProperty(prop)) ele.setAttribute(prop, attributes[prop])
  }

  return ele
}

/**
 * Displays name of stream, number of users,
 * game name, and stream image
 *
 * @param streamData    Receives parsed stream data
 */
 twitchUi.showStreamData = streamData => {
  const streamsContainer = document.getElementById('streamsContainer')
  const streamUrl = streamData.channel.url
  const streamTitle = streamData.channel.display_name
  const streamDescription = streamData.channel.status
  const streamViewers = streamData.viewers
  const streamGame = streamData.game
  const streamImg = streamData.preview.medium
  const streamGameAndViewers = streamGame + ' - ' + streamViewers + ' viewers'

  const containerDiv = twitchUi.createUiElement('div', {id: streamData._id, class:'streamsContainer'})

  const imageContainer = twitchUi.createUiElement('ul', {class:'imageContainer', style:'list-style-type:none'})
  const image = twitchUi.createUiElement('img', {src:streamImg})
  const imageLinkDiv = twitchUi.createUiElement('li', {class:'image'})
  const linkToStream = twitchUi.createUiElement('a', {class:'streamLink', title:streamTitle, href:streamUrl, rel:streamUrl + '/embed', target:'_blank', style:"text-decoration:none"})

  const streamDetails = twitchUi.createUiElement('ul', {class:'streamDetails', style:'list-style-type:none'})
  const titleHeader = twitchUi.createUiElement('li', {class:'name'})
  const info = twitchUi.createUiElement('li', {class:'streamGameAndViewers'})
  const description = twitchUi.createUiElement('li', {class:'streamDescription'})

  titleHeader.innerText = streamTitle
  info.innerText = streamGameAndViewers
  description.innerText = streamDescription

  imageLinkDiv.appendChild(image)
  imageContainer.appendChild(imageLinkDiv)

  streamDetails.appendChild(titleHeader)
  streamDetails.appendChild(info)
  streamDetails.appendChild(description)

  containerDiv.appendChild(imageContainer)
  containerDiv.appendChild(streamDetails)

  linkToStream.appendChild(containerDiv)
  streamsContainer.appendChild(linkToStream)
 }

/********************** User Interface showErrorHandler and transition effects *********************/

twitchUi.hide = selectorID => {
  const ele = document.getElementById(selectorID)
  ele.style.display = 'none'
  ele.style.filter = 'alpha(opacity = 0)'
  ele.style.opacity = 0
}

twitchUi.transition = selectorID => {
  const ele = document.getElementById(selectorID)
  let opacity = 0.5

  ele.style.display = 'block'

  const transitionTimer = setInterval(() => {
    if (opacity >= 1) clearInterval(transitionTimer)
    ele.style.filter = 'alpha(opacity=' + opacity * 100 + ")"
    ele.style.opacity = opacity
    opacity += opacity * 0.1
  }, 70)
}

twitchUi.showErrorHandler = errorHandler => {
  const errorHandlerDiv = document.getElementById('errorHandler')
  errorHandlerDiv.innerHTML = "<h3 class='errorMsg'>"+errorHandler+"</h3>"
  twitchUi.transition('errorHandler')
}
