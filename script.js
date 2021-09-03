const getCard = (name, image, status, species) => `<div class="card">
<img src="${image}" class="card-img"><div class="info">
<div class="name">${name}</div>
  <div class="status ${status}">${status} ${species}</div>
</div>
</div>`;

const content = $(".api-content");
const exitModal = $(".modal");
const chevrones = $(".chevron");

const homePage = {
  page: 1,
  totalPages: 1,
};

const clickOnCharHandler = (event) => {
  console.log(event.data.id);
  $(".modal").show();
  getCharacter(event.data.id);
};

exitModal.click(() => {
  clearModal();
  $(".modal").hide();
});

chevrones.click((el) => {
  console.log(el.currentTarget.classList.value);
  switch (el.currentTarget.classList.value) {
    case "chevron next":
      if (homePage.page >= homePage.totalPages) {
        return;
      }
      $(".api-content").empty();
      homePage.page++;
      getPage(homePage.page);
      break;
    case "chevron prev":
      if (homePage.page <= 1) {
        return;
      }
      $(".api-content").empty();
      homePage.page--;
      getPage(homePage.page);
  }
});

export const getPage = (id) =>
  fetch(`https://rickandmortyapi.com/api/character/?page=${id}`)
    .then((res) => res.json())
    .then((data) => [data.results, data.info])
    .then(([chars, info]) => {
      chars.forEach(({ id, name, image, status, species }) =>
        content.append(
          $(getCard(name, image, status, species)).click(
            { id },
            clickOnCharHandler
          )
        )
      );
      return info;
    })
    .then(({ pages }) => {
      homePage.totalPages = pages;
      $(".pages").text(`${homePage.page} of ${homePage.totalPages}`);
      switch (homePage.page) {
        case 1:
          $(".chevron.prev").addClass("disabled");
          break;
        case homePage.totalPages:
          $(".chevron.next").addClass("disabled");
          break;
        default:
          $(".chevron.next").removeClass("disabled");
          $(".chevron.prev").removeClass("disabled");
      }
    });

const getCharacter = (id) =>
  fetch(`https://rickandmortyapi.com/api/character/${id}`).then((res) =>
    res
      .json()
      .then(({ image, name, status, species, gender, location, episode }) => {
        $(".modal-img").attr("src", image);
        $(".modal-name span").text(name);
        $(".modal-status span").text(status);
        $(".modal-species").text(species);
        $(".modal-status").attr("class", `modal-status ${status}`);
        $(".modal-gender span").text(gender);
        $(".modal-location span").text(location.name);
        $(".modal-episode span").text(episode.length);
      })
  );

const clearModal = () => {
  $(".modal-img").attr("src", "");
  $(".modal-name span").text("");
  $(".modal-status span").text("");
  $(".modal-species").text("");
  $(".modal-status").attr("class", `modal-status`);
  $(".modal-gender span").text("");
  $(".modal-location span").text("");
  $(".modal-episode span").text("");
};

getPage(homePage.page);
