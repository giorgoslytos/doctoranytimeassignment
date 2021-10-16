import { State } from "./app.interfaces";

if ($(".main-content")) {
  const renderCard = (name, image, status, species) => `
    <div class="card">
      <img src="${image}" class="card-img">
      <div class="info">
        <div class="name">${name}</div>
        <div class="status ${status}">${status} ${species}</div>
      </div>
    </div>
  `;

  const renderCharacter = ({
    image,
    name,
    status,
    species,
    gender,
    location,
    episode,
  }) => `
    <div class="modal-content">
    <span class="close">&times;</span>
    <img class="modal-img" src="${image}"/>
    <p class="modal-name"><span>${name}</span></p>
    <p class="modal-status ${status}"><span>${status}</span> -</p>
    <p class="modal-species">${species}</p>
    <div class="modal-footer">
      <div class="modal-gender">Gender: 
        <img class="gender-symbol" src=${
          gender === "Male"
            ? "./images/mars-solid.svg"
            : "./images/venus-solid.svg"
        } ></img> <span>${gender}</span></div>
      <div class="modal-location">Last seen location: <span>${
        location.name
      }</span></div>
      <div class="modal-episode">
        Number of episodes appeared: <span>${episode.length}</span>
      </div>
    </div>
    </div>
  `;

  const baseUrl = "https://rickandmortyapi.com/api/character";

  const loader = () => `
    <div class="modal-content">
      <div class="loader"></div>
    </div>
  `;
  const $content = $(".api-content");
  const $modal = $(".modal");
  const $chevrones = $(".chevron");

  class App {
    state: State;
    constructor() {
      this.state = {
        page: 1,
        totalPages: null,
        character: null,
      };
    }
    fetchURLParams() {
      if (window.location.search) {
        const page = Number(
          new URLSearchParams(window.location.search).get("page")
        );
        !isNaN(page) ? (this.state.page = page) : (this.state.page = 1);
        this.state.character = Number(
          new URLSearchParams(window.location.search).get("character")
        );
        if (this.state.page < 1) {
          this.state.page = 1;
        }
      } else {
        this.state.page = 1;
      }
      this.getPageCharacters(this.state.page);
      if (this.state.character > 0) {
        $(".modal").show();
        this.getCharacter(this.state.character);
      }
    }
    getPageCharacters(id) {
      $content.append(loader);
      fetch(`${baseUrl}/?page=${id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.error === "There is nothing here") {
            this.getPageCharacters(1);
            throw new Error(res.error);
          }
          return res;
        })
        .then((data) => [data.results, data.info])
        .then(([chars, info]) => {
          $content.empty();
          chars.forEach(({ id, name, image, status, species }) =>
            $content.append(
              $(renderCard(name, image, status, species)).click(
                { id },
                this.characterHandler.bind(this)
              )
            )
          );
          window.history.pushState("nextPage", "page", `/?page=${id}`);
          return info;
        })
        .then(({ pages }) => {
          this.state.totalPages = pages;
          this.state.page = +id;
          $(".pages").text(`${this.state.page} of ${this.state.totalPages}`);
          switch (this.state.page) {
            case 1:
              $(".chevron.prev").addClass("disabled");
              break;
            case this.state.totalPages:
              $(".chevron.next").addClass("disabled");
              break;
            default:
              $(".chevron.next").removeClass("disabled");
              $(".chevron.prev").removeClass("disabled");
          }
        });
    }
    getCharacter(id) {
      $modal.append(loader);
      fetch(`${baseUrl}/${id}`).then((res) =>
        res.json().then((character) => {
          $modal.empty();
          $modal.append(renderCharacter(character));
          window.history.pushState(
            "character-view",
            "character-view",
            `/?page=${this.state.page}&character=${id}`
          );
        })
      );
    }
    chevronHandler(event) {
      switch (event.currentTarget.classList.value) {
        case "chevron next":
          if (this.state.page >= this.state.totalPages) {
            return;
          }
          $(".api-content").empty();
          this.state.page++;
          this.getPageCharacters(this.state.page);
          break;
        case "chevron prev":
          if (this.state.page <= 1) {
            return;
          }
          $(".api-content").empty();
          this.state.page--;
          this.getPageCharacters(this.state.page);
      }
    }
    characterHandler(event) {
      $(".modal").show();
      this.getCharacter(event.data.id);
    }
    clearModal() {
      $modal.empty();
      window.history.pushState("nextPage", "page", `/?page=${this.state.page}`);
      $(".modal").hide();
    }
  }

  const app = new App();
  $chevrones.on("click", app.chevronHandler.bind(app));
  $modal.on("click", app.clearModal.bind(app));
  app.fetchURLParams();
}
