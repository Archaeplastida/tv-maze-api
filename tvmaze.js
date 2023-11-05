"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
let episodeData = []

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const aShow = await axios.get("https://api.tvmaze.com/search/shows", {params:{q:term}});
  console.log(aShow);
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

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
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

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  console.log(shows);
  $episodesArea.hide();
  populateShows(shows);
}

async function getEpisodes(id){
  episodeData = [];
  const theEpisodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  for(let episode in theEpisodes.data){
  episodeData.push({id:theEpisodes.data[episode].id, name:theEpisodes.data[episode].name, season:theEpisodes.data[episode].season, 
  number:theEpisodes.data[episode].number});
}
populateEpisodes(episodeData)
return episodeData;
}

function populateEpisodes(episodes){
  if($("#episodesList").length > 0){
    $("#episodesList").html("");
  }
  for(let x of episodes){
    $("#episodesList").append(`<li>${x.name} - S${x.season}E${x.number}</li>`)
  }
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$("#showsList").on("click", "button.Show-getEpisodes", async function(evt){
  evt.preventDefault();
  await getEpisodes($(evt.target).attr("data-episode-id"));
  console.log(episodeData);
  $("#episodesArea").attr("style", "display=inline")
  
})