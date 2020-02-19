import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-scrumboard',
  templateUrl: './scrumboard.component.html',
  styleUrls: ['./scrumboard.component.css']
})
export class ScrumboardComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.load()
    this.rose()
    this.close()
    // this.imageName()
  }

  public imgName = "No image selected";
  public alert
  
  load(){
    if (window.localStorage) {
      if (!localStorage.getItem('firstLoad')) {
        localStorage['firstLoad'] = true;
        window.location.reload();
      }
      else
        localStorage.removeItem('firstLoad');
    }
    window.onload = function() {
      $(".preloader").slideUp(1300);
    }; 
  }

  NotificationBox(alert) {
    let x = document.getElementById("alert");
    document.getElementById('alert').innerHTML = alert;
    x.className = "show";
    setTimeout(function () {
      x.className = x.className.replace("show", "");
    }, 3000);
  }

  
  close(){
    let hides = document.getElementById("splitLeft") as HTMLElement;
    let moda = document.getElementById("addTaskModal") as HTMLElement;
    let moda1 = document.getElementById("addNoteModal") as HTMLElement;
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;
    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    moda.style.display = "none";
    moda1.style.display = "none";
    hides.style.overflowY = "scroll";
    openEditTaskModal.style.display = "none";
    uploadImageModal.style.display = "none";
    taskHistoryModal.style.display = "none";
    logoutModal.style.display = "none";
    appInfoModal.style.display = "none";
    userProfileModal.style.display = "none";

    
  }

  editTask () {
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    openEditTaskModal.style.display = "block";
  }

  uploadImage () {
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    uploadImageModal.style.display = "block";
  }

  taskHistory () {
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    taskHistoryModal.style.display = "block";
  }

  userProfile () {
    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    userProfileModal.style.display = "block"
  }

  appInfo () {
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;
    appInfoModal.style.display = "block"
  }

  logout () {
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    logoutModal.style.display = "block"
  }


  rose(){
    let modal = document.getElementById("addTaskModal") as HTMLElement;
    let btnmod = document.getElementById("addTaskBtn") as HTMLElement;

    let modal1 = document.getElementById("addNoteModal") as HTMLElement;
    let btnmod1 = document.getElementById("addNoteBtn") as HTMLElement;

    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;

    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;

    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;

    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;

    let hides = document.getElementById("splitLeft") as HTMLElement;

    let ttAddTask = document.getElementById("ttAddTaskBtn") as HTMLElement;
    let ttAddNote = document.getElementById("ttAddNoteBtn") as HTMLElement;
    let ttUserHistory = document.getElementById("ttUserHistoryBtn") as HTMLElement;

    btnmod.onclick = function () {
      modal.style.display = "block";
    }

    ttAddTask.onclick = function () {
      modal.style.display = "block";
    }

    btnmod1.onclick = function () {
      modal1.style.display = "block";
    }

    ttAddNote.onclick = function () {
      modal1.style.display = "block";
    }

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }

      if (event.target == modal1) {
        modal1.style.display = 'none';
        hides.style.overflowY = "scroll";
      }

      if(event.target == openEditTaskModal) {
        openEditTaskModal.style.display = "none";
      }

      if (event.target == uploadImageModal) {
        uploadImageModal.style.display = "none";
      }

      if (event.target == taskHistoryModal) {
        taskHistoryModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == userProfileModal) {
        userProfileModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == appInfoModal) {
        appInfoModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == logoutModal) {
        logoutModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

    }

    window.onclick = function (event) {
      let project = document.getElementsByClassName("projectsDropDown");
      // if (event.target.matches("#projectTab")) {
      //   // let projectDrop = document.getElementsByClassName("projectsDropDownContent");
      //   // let i;
      //   // for (i = 0; i < projectDrop.length; i++) {
      //   //   let openProjectDropdown = projectDrop[i];
      //   //   if (openProjectDropdown.classList.contains('ppDD')) {
      //   //     openProjectDropdown.classList.remove('ppDD');
      //   //   }
      //   // }
      //   console.log('outside')
      // } else {
      //   console.log('inside')
      // }
    }
  }

  hideslackchat() {
    let hideS = document.getElementById("splitRight") as HTMLElement;
    let hides = document.getElementById("splitLeft") as HTMLElement;
    hideS.style.zIndex = "0";
    hides.style.overflowY = "hidden";
  }

  imageName() {
    let name = document.getElementById('imgUpload') as HTMLInputElement;
    let progressBar = document.getElementById("progressBar");
    let width = 1;
    let progressId = setInterval(time, 10);
    this.imgName = name.files.item(0).name;
    function time() {
      if (width >= 100) {
        clearInterval(progressId);
      } else {
        width++; 
        progressBar.style.width = width + '%'; 
      }
    }
  }


  imageUploadAlert () {
    let name = document.getElementById('imgUpload') as HTMLInputElement;
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    if(name.value.length >= 1) {
      uploadImageModal.style.display = "none";
      this.NotificationBox("Image Uploaded Successfully");
    }
  }

  copyToClipboard(containerId) {
    let range = document.createRange();
    range.selectNode(document.getElementById(containerId));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    this.NotificationBox("Copied to clipboard!")
  }

  showTeamTaskDropDown() {
    let dropDownCBtn = document.getElementById('ttDropDown');
    let toggled = document.getElementById('toggledDown');
    let untoggled = document.getElementById('toggledUp');
    let ttDropDownMenu = document.getElementById('teamTaskDropDownMenu');
    
    dropDownCBtn.classList.toggle('showDropDown');
    ttDropDownMenu.classList.toggle('teamTaskDropDownMenuToggle');
    
    
    if (untoggled.className == 'fas fa-chevron-up') {
      untoggled.className = ('fas fa-chevron-down')
    } else if (untoggled.className == 'fas fa-chevron-down') {
      untoggled.className = ('fas fa-chevron-up')
    }
    
    
  }

  hideAddTaskandNoteBTN() {
    document.getElementById('addTaskBtn').style.display = 'none';
    document.getElementById('addNoteBtn').style.display = 'none';

  }

  showAddTaskandNoteBTN() {
    document.getElementById('addTaskBtn').style.display = 'block';
    document.getElementById('addNoteBtn').style.display = 'block';

  }

  showProjectTabContents() {
    let projectDropDown = document.getElementById("projectsDDContent") as HTMLElement;
    projectDropDown.classList.toggle("ppDD");
  }

  selectThemeTabContents() {
    let projectDropDown = document.getElementById("themeDDContent") as HTMLElement;
    projectDropDown.classList.toggle("ppDD");
  }

  

  showSprintTabContents() {
    let sprintDropDown = document.getElementById("sprintDDContent") as HTMLElement;
    sprintDropDown.classList.toggle("spDD");
  }

   
}