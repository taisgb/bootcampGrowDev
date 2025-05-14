document.addEventListener("DOMContentLoaded", main);

async function main() {
  loadMainContent(1);
  renderFooterData();
}

document.getElementById("search").addEventListener("input", async (event) => {
  const termo = event.target.value.toLowerCase();
  const resultado = await listCharactersByPage(1); 

  const personagens = resultado.charactersList.filter(personagem =>
    personagem.name.toLowerCase().includes(termo)
  );

  for (const character of personagens) {
    const lastEpisodeUrl = character.episode[character.episode.length - 1];
    const episodeName = await getEpisodeDataFromURL(lastEpisodeUrl);
    character.episode = {
      url: lastEpisodeUrl,
      name: episodeName,
    };
  }
  //Buscar em toda api
  document.getElementById("search").addEventListener("input", async (event) => {
  const termo = event.target.value.trim().toLowerCase();

  if (termo === "") {
    loadMainContent(1);
    return;
  }

  try {
    const personagens = await searchCharactersByName(termo);

    for (const character of personagens) {
      const lastEpisodeUrl = character.episode[character.episode.length - 1];
      const episodeName = await getEpisodeDataFromURL(lastEpisodeUrl);
      character.episode = {
        url: lastEpisodeUrl,
        name: episodeName,
      };
    }

    renderCharactersList(personagens);
    document.getElementById("pagination").innerHTML = "";
  } catch (error) {
    document.getElementById("list-characters").innerHTML = "<p class='text-center text-muted'>Nenhum personagem encontrado.</p>";
    document.getElementById("pagination").innerHTML = "";
  }
});

  renderCharactersList(personagens);
});


async function loadMainContent(page) {
  const result = await listCharactersByPage(page);

  const characters = [...result.charactersList];

  for (const character of characters) {
    const lastEpisodeUrl = character.episode[character.episode.length - 1];
    const episodeName = await getEpisodeDataFromURL(lastEpisodeUrl);

    character.episode = {
      url: lastEpisodeUrl,
      name: episodeName,
    };
  }

  renderCharactersList(characters);
  renderPagination(result.prevPage, result.nextPage);
}

function mapStatus(status) {
  const statusMap = {
    Alive: { color: "success", text: "Vivo" },
    Dead: { color: "danger", text: "Morto" },
    unknown: { color: "secondary", text: "Desconhecido" },
  };

  return statusMap[status] || { color: "secondary", text: status };
}

function mapSpecie(species) {
  return species === "Human" ? "Humano" : species;
}

function mapGender(gender) {
    const genderMap = {
        Male: "Masculino",
        Female: "Feminino",
        Genderless: "Sem gênero",
        unknown: "Desconhecido"
    };
    return genderMap[gender] || gender;
}

function traduzirLocalizacao(texto) {
  return texto
    .replace("Earth", "Terra")
    .replace("earth", "Terra")
    .replace("unknown", "Desconhecido");
}

function renderCharactersList(characters) {
  const row = document.getElementById("list-characters");
  row.innerHTML = "";

  for (const character of characters) {
    let nameCharacter = character.name;
    if (nameCharacter.length > 18) {
      nameCharacter = nameCharacter.slice(0, 18).concat("...");
    }

    const card = `
      <div class="shadow-drop-2-tl card mb-3 card-character" 
        onclick="openCharacterModal(${character.id})" 
        data-bs-toggle="modal" 
        data-bs-target="#characterModal">
        <div class="row g-0">
          <div class="col-12 col-md-5">
            <div class="object-fit-fill border rounded h-100">
              <img src="${character.image}" class="w-100 h-100 rounded" alt="Foto do Personagem ${character.name}">
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="card-body fw-bolder">
              <h5 class="card-title">${nameCharacter}</h5>
              <p class="card-text">
                <small>
                  <i id="circle-status" class="bi bi-circle-fill text-${mapStatus(character.status).color}"></i>
                  <span>${mapStatus(character.status).text} - ${mapSpecie(character.species)}</span>
                </small>
              </p>
              <p class="card-text">
                <small class="text-secondary">Última localização conhecida:</small><br>
                <small>${traduzirLocalizacao(character.location.name)}</small>
              </p>
              <p class="card-text">
                <small class="text-secondary">Visto a última vez em:</small><br>
                <small>${character.episode.name}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const col = document.createElement("div");
    col.classList.add("col-12", "col-md-6");
    col.innerHTML = card;
    row.appendChild(col);
  }
}




async function openCharacterModal(characterId) {
  const character = await getCharacterById(characterId);
  const lastEpisodeUrl = character.episode[character.episode.length - 1];
  const episodeName = await getEpisodeDataFromURL(lastEpisodeUrl);

  const html = `
    <div class="row">
      <div class="col-md-4">
        <img src="${character.image}" class="img-fluid rounded" alt="${character.name}">
      </div>
      <div class="col-md-8">
        <h4>${character.name}</h4>
        <p><strong>Status:</strong> ${mapStatus(character.status).text}</p>
        <p><strong>Espécie:</strong> ${mapSpecie(character.species)}</p>
        <p><strong>Gênero:</strong> ${mapGender(character.gender)}</p>
        <p><strong>Origem:</strong> ${traduzirLocalizacao(character.origin.name)}</p>
        <p><strong>Última localização:</strong> ${traduzirLocalizacao(character.location.name)}</p>
        <p><strong>Último episódio:</strong> ${episodeName}</p>
      </div>
    </div>
  `;

  document.getElementById("modal-character-content").innerHTML = html;
}


function renderPagination(prevPage, nextPage) {
  const prevPageNumber = !prevPage ? 0 : prevPage.split("?page=")[1];
  const nextPageNumber = !nextPage ? 0 : nextPage.split("?page=")[1];

  const nav = document.getElementById("pagination");
  nav.innerHTML = "";
  const ul = document.createElement("ul");
  ul.classList.add("pagination", "justify-content-center");

  const liPrevPage = document.createElement("li");
  liPrevPage.classList.add("page-item");
  if (!prevPage) liPrevPage.classList.add("disabled");

  const buttonPrev = document.createElement("button");
  buttonPrev.setAttribute("type", "button");
  buttonPrev.classList.add("page-link");
  buttonPrev.innerText = "Anterior";
  buttonPrev.addEventListener("click", () => loadMainContent(prevPageNumber));
  liPrevPage.appendChild(buttonPrev);

  const liNextPage = document.createElement("li");
  liNextPage.classList.add("page-item");
  if (!nextPage) liNextPage.classList.add("disabled");

  const buttonNext = document.createElement("button");
  buttonNext.setAttribute("type", "button");
  buttonNext.classList.add("page-link");
  buttonNext.innerText = "Próxima";
  buttonNext.addEventListener("click", () => loadMainContent(nextPageNumber));
  liNextPage.appendChild(buttonNext);

  ul.appendChild(liPrevPage);
  ul.appendChild(liNextPage);
  nav.appendChild(ul);
}

async function renderFooterData() {
    const totalCharacter = await getTotalByFeature("character");
    const totalLocation = await getTotalByFeature("location");
    const totalEpisode = await getTotalByFeature("episode");

    const spanTotalCharacters = document.getElementById("total-characters");
        spanTotalCharacters.innerText = totalCharacter 

    const spanTotalLocations = document.getElementById("total-locations");
        spanTotalLocations.innerText = totalLocation

    const spanTotalEpisodes = document.getElementById("total-episodes");
        spanTotalEpisodes.innerText = totalEpisode

    const spanDevName = document.getElementById("dev-name");
        spanDevName.innerText = "Taís GB";

    const spanYear = document.getElementById("current-year");
       spanYear.innerText = new Date().getFullYear();
}

  