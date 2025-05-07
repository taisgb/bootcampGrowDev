document.addEventListener('DOMContentLoaded', main);

async function main() {
    const result = await listCharactersByPage();

    renderCharactersList(result.characterList);    

}

async function renderCharactersList(characters) {
    const row = document.getElementById("list-characters");
    row.innerHTML = "";    

    for(const character of characters) {

        const lastEpisodeUrl = character.episode[character.episode.length - 1];
        const lastEpisodeName = await getEpisodeDataFromURL(lastEpisodeUrl);

        const card = `
        <div class="col-12 col-md-4 col-sm-6 col-lg-4">
                  <div class="card">
                    <img src="${character.image}">
                    <div class="card-body fw-bolder">
                      <h5 class="card-title">${character.name}</h5>                    
                      <p class="card-text">
                        <small class="subtitle">
                            <i id="circle_status" class="bi bi-circle-fill text-${mapStatus(character.status).color}"></i>
                            <span>${mapStatus(character.status).text} - ${mapSpecie(character.species)}</span>                        
                        </small>
                      </p>
                      <p class="card-text">
                        <small class="text-body-secondary">            
                            Última localização conhecida:                        
                        </small><br>
                        <small class="text-body-secondary">            ${character.location.name}                     
                         </small>
                      </p>
                      <p class="card-text">
                        <small class="text-body-secondary">       
                           Visto a última vez em:                        
                        </small><br>
                        <small class="text-body-secondary">           ${lastEpisodeName}                     
                         </small>
                      </p>
                      <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                  </div>
            </div>
        `;

        const col = document.createElement('div');
        col.classList.add("col-md-4", "col-sm-6", "col-lg-4"); 

        col.innerHTML = card;
        row.appendChild(col);
    }

}

function mapStatus(characterStatus) {
    switch(characterStatus) {
        case "Alive":
            return {
                color: "success",
                text: "Vivo"
            };
        case "Dead":
            return {
                color: "danger",
                text: "Morto"
            };  
        default:
            return {
                color: "secondary",
                text: "Desconhecido",
            } 
    }
}

function mapSpecie(characterSpecie) {
    switch(characterSpecie) {
        case "Human":
            return "Humano";
        case "Alien":
            return "Alien";
        case "Robot":
            return "Robô";     
        default:
            return `Outro (${characterSpecie})`
             
    }
}

