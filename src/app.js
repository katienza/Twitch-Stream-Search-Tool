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
 * Builds URL based on base URL, input within the search form field,
 * api limit, stringified json, and client ID.
 * Returns URL.
 */
searchFormUtil.buildSearchUrl = () => {
  const query = searchFormUtil.getFormValue('apiSearchQuery')
  const queryParams = 'search/streams?q='+query+'&limit=5&callback=stringifyjsoncb&client_id=imsyx3x5l3ld754zt6wkzwntlqiwou'

  if (query || query.length > 0) {
    return encodeURI(queryParams)
  } else {
    // twitchUi.showError('Insert a query in the text field.')
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
  // if (!res) twitchUi.showError('Cannot find results for your current search. Please try again.')
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
    twitchUi.build(totalFound, links, streams)
  }
}

function stringifyjsoncb(data) {
  twitchQuery.handleResponses(JSON.stringify(data))
}

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

/********************** User Interface Viewers & Pagination Methods *********************/

/**
 * Returns total stream count, current/total page count,
 * and next and previous pagination
 *
 * @param totalStreams    Receives value for number of streams
 * @param links     Receives next and prev values
 * @param streamsList     Receives array list of streams
 */
twitchUi.build = (totalStreams, links, streamsList) => {
  let streamsCount = document.getElementById('searchResultsTotal')
  let pageTurner = document.getElementById('searchResultsPages')
  streamsCount.innerHTML = 'Total results: ' + totalStreams
  let totalPages = Math.ceil(totalStreams / 20)
  let pagination = ""

  if (typeof links.prev !== 'undefined') {
    pagination += "<a id='prevBtn' href='"+links.prev+"'>&ltrif;</a>"
  }

  pagination += "<span id='pageCount'>"+ twitchUi.pages+"/"+totalPages+"</span>"

  if (typeof links.next !== 'undefined' && (twitchUi.pages < totalPages)) {
    pagination += " <a id='nextBtn' href='"+links.next+"'>&rtrif;</a>"
  }

  pageTurner.innerHTML = pagination

  twitchUi.initPageClick('nextBtn')
  twitchUi.initPageClick('prevBtn')

  document.getElementById('streamsContainer').innerHTML = ""

  for (let props in streamsList) {
    if (streamsList.hasOwnProperty(props)) twitchUi.showStreamData(streamsList[props])
  }
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
  let res = twitchQuery.updateHeaders(pageAPIUrl+"&callback=stringifyjsoncb&client_id=imsyx3x5l3ld754zt6wkzwntlqiwou")


  if (res && btnID === 'prevBtn') {
    twitchUi.pages = twitchUi.pages - 1
  } else if (res && btnID === 'nextBtn') {
    twitchUi.pages = twitchUi.pages + 1
  } else {
  //   twitchUi.showError('An error has occured. Please try again.')
  }
}


/********************** User Interface Stream Display Methods *********************/

/**
 * Displays name of stream, number of users,
 * game name, and stream image
 *
 * @param streamData    Receives parsed stream data
 */
 twitchUi.showStreamData = streamData => {
  const streamsContainer = document.getElementById('streamsContainer')
  const streamUrl = streamData.channel.url
  const streamTitle = streamData.channel.status
  const streamViewers = streamData.viewers
  const streamGame = streamData.game
  const streamImg = streamData.preview.medium
  const streamGameAndViewers = streamGame + ' - ' + streamViewers + ' viewers'

  const linkToStream = twitchUi.createUiElement('a', {class:'streamLink', title:streamTitle, href:streamUrl, rel:streamUrl + '/embed', target:'_blank'})
  const containerDiv = twitchUi.createUiElement('div', {class:'streamsContainer'})
  const titleHeader = document.createElement('H2')
  const imageContainerDiv = twitchUi.createUiElement('div', {class:'image'})
  const image = twitchUi.createUiElement('img', {src:streamImg})
  const info = twitchUi.createUiElement('div', {class:'streamInfo'})

  titleHeader.innerText = streamTitle
  info.innerText = streamGameAndViewers

  linkToStream.appendChild(image)
  imageContainerDiv.appendChild(linkToStream)
  containerDiv.appendChild(titleHeader)
  containerDiv.appendChild(info)
  containerDiv.appendChild(imageContainerDiv)
  streamsContainer.appendChild(containerDiv)
 }

twitchUi.createUiElement = (element, attributes) => {
  const ele = document.createElement(element)

  for (let prop in attributes) {
    if (attributes.hasOwnProperty(prop)) ele.setAttribute(prop, attributes[prop])
  }

  return ele
}

