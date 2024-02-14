const musicData = [
  {"id":"7LHAKF7pBqHch8o6Yo0ad5","title":"Suzume","artist":"RADWIMPS","album":"Suzume OST","duration":"3:56","icon":"suzume.jpeg"},
  {"id":"2e1gUS6Wv8GS8ZT6FMeE1J","title":"ただ声一つ","artist":"ロクデナシ","album":"ただ声一つ","duration":"2:41","icon":"ただ声一つ.jpeg"},
  {"id":"2qZTUO5GK75nRP6HxYlSpo","title":"Everlasting Summer","artist":"Seycara Orchestral, Hikaru Station","album":"Everlasting Summer","duration":"4:22","icon":"everlasting summer.jpeg"}
];
const tagList = ["Instrumental","English","Japanese"];

function addTag(tag) {
  const tableHeader = document.getElementById('musicTableHeader');
  const headerCell = document.createElement('th');
  headerCell.textContent = tag;
  headerCell.classList.add('tag');
  tableHeader.appendChild(headerCell);

  const rows = document.querySelectorAll('#musicTableBody tr');
  rows.forEach(row => {
    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);
  });
}

function addSong(song) {
  const tableBody = document.getElementById('musicTableBody');
  const tagsCount = document.querySelectorAll('#musicTableHeader .tag').length;
  const row = document.createElement('tr');
  row.id = `song-${song.id}`;

  const cellHtml = [
    `<td><img src="assets/${song.icon}" alt="${song.album}"></td>`,
    `<td>${song.title}</td>`,
    `<td>${song.artist}</td>`,
    `<td>${song.album}</td>`,
    `<td>${song.duration}</td>`
  ];
  for (let i = 0; i < tagsCount; i++) {
    cellHtml.push(`<td><input type="checkbox"></td>`);
  }

  row.innerHTML = cellHtml.join('');
  tableBody.appendChild(row);
}

document.addEventListener('DOMContentLoaded', function() {
  // Either order should work.
  // Songs then tags
  musicData.forEach(addSong);
  tagList.forEach(addTag);

  // // Tags then songs
  // tagList.forEach(addTag);
  // musicData.forEach(addSong);
});











function getTaggedSongs(tag) {
  const taggedSongs = {};
  const headers = Array.from(document.querySelectorAll('#musicTableHeader th'));
  const tagIndex = headers.findIndex(header => header.textContent === tag);
  // Tag doesn't exist
  if (tagIndex === -1) return taggedSongs;

  // Find all rows in the body
  const rows = document.querySelectorAll('#musicTableBody tr');
  rows.forEach(row => {
    const songId = row.getAttribute('id');
    const checkbox = row.children[tagIndex].children[0];
    taggedSongs[songId] = checkbox?checkbox.checked:null;
  });

  return taggedSongs;
}
function setTaggedSongs(tag, map) {
  const headers = Array.from(document.querySelectorAll('#musicTableHeader th'));
  const tagIndex = headers.findIndex(header => header.textContent === tag);

  // If the tag doesn't exist, exit the function
  if (tagIndex === -1) return;

  // Find all rows in the body
  const rows = document.querySelectorAll('#musicTableBody tr');
  rows.forEach(row => {
    const songId = row.getAttribute('id');
    const checkbox = row.children[tagIndex].children[0];

    if (checkbox) {
      // Set the checked property based on whether the songId is in the map
      // If the songId is not in the map, it defaults to false (unchecked)
      checkbox.checked = !!map[songId];
    }
  });
}