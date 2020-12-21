// Saves options to localStorage.
function save_options() {


  //artist folder
  var inputBox = document.getElementById("path");
  var saveJsonCheckBox = document.getElementById("save-json");
  var artistFolderCheckBox = document.getElementById("artist-folder");
  var artworkFolderCheckBox = document.getElementById("artwork-folder");
  var artworkRenameCheckBox = document.getElementById("artwork-rename");

  var path = (inputBox.value == '') ? 'ArtstationDownloader' : inputBox.value;
  var saveJson = saveJsonCheckBox.checked;
  var artistFolder = artistFolderCheckBox.checked;
  var artworkFolder = artworkFolderCheckBox.checked;
  var artworkRename = artworkRenameCheckBox.checked;

  localStorage["ad-path"] = path;
  localStorage["ad-save-json"] = saveJson;
  localStorage["ad-artist-folder"] = artistFolder;
  localStorage["ad-artwork-folder"] = artworkFolder;
  localStorage["ad-artwork-rename"] = artworkRename;
  console.log(path);
  console.log(saveJson);
  console.log(artistFolder);
  console.log(artworkFolder);
  console.log(artworkRename);
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var favorite = localStorage["ad-path"];
  if (!favorite) {
    console.log("ArtstationDownloader: No path saved.")
  } else {
    var inputBox = document.getElementById("path");
    inputBox.value = favorite;
  }
  var saveJson = localStorage["ad-save-json"];
  if (!saveJson) {
    console.log("ArtstationDownloader: No option set.")
  } else {
    var checkbox = document.getElementById("save-json");
    checkbox.checked = (saveJson === 'true');
  }

  //artist folder
  var artistFolder = localStorage["ad-artist-folder"];
  if (!artistFolder) {
    console.log("ArtstationDownloader: No artist-folder option set.")
  } else {
    var artistFolderCheckBox = document.getElementById("artist-folder");
    artistFolderCheckBox.checked = (artistFolder === 'true');
  }

  //artwork folder
  var artworkFolder = localStorage["ad-artwork-folder"];
  if (!artworkFolder) {
    console.log("ArtstationDownloader: No artwork-folder option set.")
  } else {
    var artworkFolderCheckBox = document.getElementById("artwork-folder");
    artworkFolderCheckBox.checked = (artworkFolder === 'true');
  }

  //artwork folder
  var artworkRename = localStorage["ad-artwork-rename"];
  if (!artworkRename) {
    console.log("ArtstationDownloader: No artwork-rename option set.")
  } else {
    var artworkRenameCheckBox = document.getElementById("artwork-rename");
    artworkRenameCheckBox.checked = (artworkRename === 'true');
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
