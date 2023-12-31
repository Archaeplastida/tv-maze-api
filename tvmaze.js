"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
let episodeData = [] //This stores data about each episode for each indivdual show; when the time comes, it comes in use and helps store the information about the episodes of the show and gives information to display.

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) { //This whole thing retrives the information about the shows from the API from a given search result
  const aShow = await axios.get("https://api.tvmaze.com/search/shows", {params:{q:term}});
  const showList = [];
  for(let i in aShow.data){
    if (!aShow.data[i].show.summary){
      aShow.data[i].show.summary = ""
    }
    if (!aShow.data[i].show.image){
      aShow.data[i].show.image = {original:"https://static.tvmaze.com/images/no-img/no-img-portrait-text.png"}
    }
    try{
    const theShow = {
      id: aShow.data[i].show.id,
      name: aShow.data[i].show.name,
      summary:aShow.data[i].show.summary,
      image: aShow.data[i].show.image.original
    }
    showList.push(theShow);} catch{}
};
return showList;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) { //This function is reponsible for adding the elements to the DOM
  $showsList.empty();

  for (let show of shows) { //This creates the HTML for the show on the page
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button data-episode-id="${show.id}" class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() { //This will use the getShowsByTerm and populateShows functions to handle search form submission
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

async function getEpisodes(id){ //This will pull out all the episodes of a given show by ID from its API URL
  episodeData = [];
  const theEpisodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  for(let episode in theEpisodes.data){
  episodeData.push({id:theEpisodes.data[episode].id, name:theEpisodes.data[episode].name, season:theEpisodes.data[episode].season, 
  number:theEpisodes.data[episode].number});
}
populateEpisodes(episodeData)
return episodeData;
}

function populateEpisodes(episodes){ //This will create the lis for the shows' episode
  if($("#episodesList").length > 0){
    $("#episodesList").html("");
  }
  for(let x of episodes){
    $("#episodesList").append(`<li>${x.name} - S${x.season}E${x.number}</li>`)
  }
}

$searchForm.on("submit", async function (evt) { //When the form is submitted, it will start call the searchForShowAndDisplay function to tell it that it needs to search for the shows from the input
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$("#showsList").on("click", "button.Show-getEpisodes", async function(evt){ //When clicked, it shows the episode list for a given show that it's clicked under
  evt.preventDefault();
  await getEpisodes($(evt.target).attr("data-episode-id"));
  $("#episodesArea").attr("style", "display=inline")
  
})