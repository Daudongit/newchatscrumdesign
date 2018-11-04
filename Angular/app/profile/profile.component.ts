import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MzModalModule } from 'ngx-materialize';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public arrCount = [0, 1, 2, 3];
  subs = new Subscription();
  public show_zero: boolean = true;
  public chat_text: string = "";
  public messages = [];
  public websocket;
  public msg_obs;
  public on_user;
  public at_bottom: boolean = true;
  public id_hover = -1;
  public id_click = -1;
  sprint_start: Number;
  sprint_end: Number;
    
  public modalOptions: Materialize.ModalOptions = {
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '100%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: (modal, trigger) => { // Callback for Modal open. Modal and trigger parameters available.
      alert('Ready');
      console.log(modal, trigger);
    },
    complete: () => { alert('Closed'); } // Callback for Modal close
  };
  
  constructor(
      public dataservice: DataService, private dragula: DragulaService, private http: HttpClient, private modalModule: MzModalModule
      ) { 
    this.dragula.createGroup('mainTable', {
        revertOnSpill: true,
        direction: 'horizontal',
        invalid: (el) => {
            return el.id == 'author' || el.id == 'remove' || el.id == 'blank';
        }
    });
    
    this.subs.add(
        this.dragula.drop('mainTable').subscribe(
            value => {
                console.log(value);
                var el = value['el'];
                var target = value['target'];
                var source = value['source'];
                
                if (target['parentElement'] == source['parentElement']) {
                    var hours = -1;
                    if(target['id'] == '2' && source['id'] == '1')
                    {
                        var hours_in = window.prompt('How many hours did you spend on this task?');
                        hours = parseInt(hours_in, 10);
                        if(hours + '' == 'NaN')
                            hours = -1;
                    }
                    this.dataservice.moveGoal(el['id'], target['id'], hours);
                } else {
                    this.dataservice.changeOwner(el['id'], target['parentElement']['id']);
                } 
            }
        )
    );
    
    this.dataservice.realname = sessionStorage.getItem('realname');
    this.dataservice.username = sessionStorage.getItem('username');
    this.dataservice.role = sessionStorage.getItem('role');
    this.dataservice.project = sessionStorage.getItem('project_id');

    this.dataservice.authOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };

    this.msg_obs = new MutationObserver((mutations) => {
        var chat_scroll = document.getElementById('chat_div_space');
        console.log(chat_scroll.scrollHeight - chat_scroll.clientHeight);
        console.log(chat_scroll.scrollTop);
        if(this.at_bottom)
            chat_scroll.scrollTop = chat_scroll.scrollHeight - chat_scroll.clientHeight;
        console.log(this.messages);
    });

    this.websocket = new WebSocket('ws://' + this.dataservice.domain_name + '/scrum/');
    this.websocket.onopen = (evt) => {
        this.http.get('http://' + this.dataservice.domain_name + '/scrum/api/scrumprojects/' + this.dataservice.project + '/', this.dataservice.httpOptions).subscribe(
            data => {
                console.log(data);
                this.msg_obs.observe(document.getElementById('chat_div_space'), { attributes: true, childList: true, subtree: true });
                this.dataservice.project_name = data['project_name'];
                // this.dataservice.sprints = data.project_sprint
                // this.dataservice.sprints = Array.of(this.dataservice.sprints); 
                // console.log(this.dataservice.sprints)
                this.dataservice.users = data['data'];
                this.websocket.send(JSON.stringify({'user': this.dataservice.realname, 'message': '!join ' + this.dataservice.project_name}));
            },
            err => {
                this.dataservice.message = 'Unexpected Error!';
                console.log(err);
            }
        );
    }

    this.websocket.onmessage = (evt) => {
        var data = JSON.parse(evt.data);
        if(data['messages'] !== undefined)
        {
            this.messages = []
            for(var i = 0; i < data['messages']['length']; i++)
            {
                this.messages.push(data['messages'][i]['user'] + ': ' + data['messages'][i]['message']);
            }
        } else
        {
            this.messages.push(data['user'] + ': ' + data['message']);
        }
        this.at_bottom = false;
        var chat_scroll = document.getElementById('chat_div_space');
        if(chat_scroll.scrollTop == chat_scroll.scrollHeight - chat_scroll.clientHeight)
            this.at_bottom = true;
    }

    this.websocket.onclose = (evt) => {
        console.log('Disconnected!');
        this.msg_obs.disconnect();
    }
  }
  

  swapState()
  {
    this.show_zero = !this.show_zero;  
  }

  createSprint() 
  {
    var myDate = new Date(new Date().getTime()+(7*24*60*60*1000));
    this.http.post('http://' + this.dataservice.domain_name + '/scrum/api/scrumsprint/', JSON.stringify({'project_id': this.dataservice.project, 'ends_on': myDate}), this.dataservice.authOptions).subscribe(
      data => {
        console.log(data)
        this.dataservice.sprints = data['data'].filter(
          sprints => sprints.goal_project_id == this.dataservice.project );
        console.log(this.dataservice.project)
        console.log(this.dataservice.sprints)
        this.dataservice.message = data['message'];
        if (this.dataservice.sprints.length) {
         this.dataservice.sprint_start = this.dataservice.sprints[this.dataservice.sprints.length - 1].created_on
         this.dataservice.sprint_end = this.dataservice.sprints[this.dataservice.sprints.length - 1]. ends_on
        }
      },
      err => {
        console.error(err);
          if(err['status'] == 401)
            {
              this.dataservice.message = 'Session Invalid or Expired. Please Login.';
              this.dataservice.logout();
          } else
            {
              this.dataservice.message = 'Unexpected Error!';    
            }
          }
        );
  } 

  changeSprint(sprint) 
  {
    if(sprint.created_on && sprint.ends_on ) {
      this.dataservice.sprint_start = sprint.created_on 
      this.dataservice.sprint_end = sprint.ends_on
    } else {
      console.log('Error Loading Sprint')
    }
  }

  // setNewUser(user: User): void {
  //   console.log(user);
  //   this.curUser = user;
  //   }
  
  editGoal(event)
  {
    console.log(event);
    console.log(this.dataservice.users);
    var taskID = event.target.parentElement.id.substring(1);
    var message = null;
    for(var i = 0; i < this.dataservice.users.length; i++)
    {
        if(this.dataservice.users[i].id == event.target.parentElement.parentElement.parentElement.id.substring(1))
        {
            for(var j = 0; j < this.dataservice.users[i].scrumgoal_set.length; j++)
            {
                if(this.dataservice.users[i].scrumgoal_set[j].id == taskID)
                {
                    message = this.dataservice.users[i].scrumgoal_set[j].name;
                    break;
                }
            }
            break;
        }
    }
    var goal_name = window.prompt('Editing Task ID #' + taskID + ':', message);
    if(goal_name == null || goal_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
    } else
    {
        this.http.put('http://' + this.dataservice.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 1, 'goal_id': event.target.parentElement.id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
            },
            err => {
                console.error(err);
                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
    }
  }

  deleteTask(goal_name, goal_id) {
      var pop_event = window.confirm('Delete " ' + goal_name + '"?');
      if (pop_event) {
          this.http.put('http://' + this.dataservice.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 2, 'goal_id':goal_id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
            },
            err => {
                console.error(err);
                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
      } else {
          console.log('cancel');
      };
    }
  
  manageUser(event)
  {
    this.getClicked(event);
    var role_name = window.prompt('Change User Role:\nSelect Between: Developer, Admin, Quality Analyst, or Owner:', '');
    if(role_name == null || role_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
        return;
    }
    role_name = role_name.toLowerCase();
    if(role_name == 'developer' || role_name == 'quality analyst' || role_name == 'admin' || role_name == 'owner')
    {
        this.http.patch('http://' + this.dataservice.domain_name + '/scrum/api/scrumprojectroles/', JSON.stringify({'role': role_name, 'id': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
            },
            err => {
                console.error(err);
                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
    } else
    {
        this.dataservice.message = 'Invalid Input.';
    }
  }
  
  doNothing()
  {
     
  }
  
  sendMessage()
  {
    this.websocket.send(JSON.stringify({'user': this.dataservice.realname, 'message': this.chat_text}))
    this.chat_text = '';
  }
  
 

  ngOnInit() {
       this.http.get('http://' + this.dataservice.domain_name + '/scrum/api/scrumsprint/', this.dataservice.authOptions).subscribe(
            data => {
              var project_sprint = [];

              for (let i in data) {
                console.log('GDDDDDDDDDDDDDDDDDDDDDDDDDD')
                if (data[i].goal_project_id == sessionStorage.getItem('project_id')) project_sprint.push(data[i]);
                console.log(i)
                console.log(project_sprint)
              }
                  this.dataservice.sprints = project_sprint
                  // this.dataservice.sprints = data.filter( function(sprint)
                  // { return sprint.goal_project_id == sessionStorage.getItem('project_id')});
                this.dataservice.message = data['message'];
                console.log(this.dataservice.sprints)
                if (this.dataservice.sprints.length) {
                  this.dataservice.sprint_start = this.dataservice.sprints[this.dataservice.sprints.length - 1].created_on;
                  this.dataservice.sprint_end = this.dataservice.sprints[this.dataservice.sprints.length - 1]. ends_on;
                };
            },
            err => {
                console.error(err);

                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
    }
  
  getClicked(event)
  {
    console.log(event);
    this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
    if(this.on_user == '')
    {
        console.log('user empty')
        this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;
    }
    console.log(this.on_user);
    console.log('user is AVAILABLE')
  }

  addGoal()
  {
    this.dataservice.addGoal(this.on_user);
  }
  
  setSelectedUser(id)
  {
    this.id_hover = id;    
  }
  
  logout()
  {
    this.dataservice.message = 'Thank you for using Scrum!';
    this.websocket.close();
    this.dataservice.logout();
  }
  
  ngOnDestroy()
  {
    this.subs.unsubscribe();  
    this.dragula.destroy('mainTable');
  }

  scrollIntoView(anchorHash) {
    this.id_click = parseInt(anchorHash.substring(1), 10);
    setTimeout(() => {
        const anchor = document.getElementById(anchorHash);
        console.log(anchorHash);
        if (anchor) {
            anchor.focus();
            anchor.scrollIntoView();
        }
    });
}

//   addGoalModal(){
//     $(document).ready(function(){
//         // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
//         $('.modal-trigger').leanModal();
//       });
//   }
}
