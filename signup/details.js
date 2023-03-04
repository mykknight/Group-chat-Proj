const save = document.getElementById('save-details');
const box = document.getElementById('group-details-box');
localStorage.setItem('activegrpdetail', null);
let input = document.getElementById('filter-input');
const addbtn = document.getElementById('search-filter');


addbtn.addEventListener('click', addtogroup);

save.addEventListener('click',close);

function close(e) {
    e.preventDefault();
    localStorage.setItem('activegrpdetail', null);
    localStorage.setItem('groupmembers', null);
    box.classList.remove('show');
}

async function detailpopup(e) {
    let obj = JSON.parse(localStorage.getItem('activegrpdetail'));
    if(!obj) {
        obj = {
            id: e.target.id,
            name: e.target.name
        }
    }
    const groups = JSON.parse(localStorage.getItem('groupss'));
    let group;
    groups.forEach(grp => {
        if(grp.id == obj.id) group = grp;
    });
    if(group.groupchat.isAdmin != true) return alert('you are not a admin');
    localStorage.setItem('activegrpdetail', JSON.stringify(obj));
    box.classList.add('show');
    document.getElementById('grp-heading').innerHTML = obj.name;

    const members = await axios.get(`http://localhost:3000/group/group-members/${group.id}`, {headers: {"Authorization": token}});
    localStorage.setItem('groupmembers', JSON.stringify(members.data));
    document.getElementById('group-userlist').innerHTML = '';
    members.data.forEach(printusers);

}

function printusers(user) {
    if(user.UserName == localStorage.getItem('user')) return;
    let ui = document.getElementById('group-userlist');
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(`${user.UserName}`));
    const adminbtn = document.createElement('input');
    adminbtn.type = 'button';
    if(user.groupchat.isAdmin == false) {
        adminbtn.value = 'Make Admin';
        adminbtn.className = 'makeadmin';
        adminbtn.addEventListener('click', makeadmin);  
    }
    else {
        adminbtn.value = 'You are a Admin';
        adminbtn.className = 'alreadyadmin';
    }
    adminbtn.id = `${user.id}`;
    const removebtn = document.createElement('input');
    removebtn.type = 'button';
    removebtn.value = 'Remove User';
    removebtn.id = `${user.id}`;
    removebtn.className = 'removeuser';
    removebtn.addEventListener('click', removeuser);
    li.appendChild(adminbtn);
    li.appendChild(removebtn);
    ui.append(li);

}

async function makeadmin(e) {
    const userid = e.target.id;
    const grpid = JSON.parse(localStorage.getItem('activegrpdetail')).id;
    const res = await axios.get(`http://localhost:3000/group/makeadmin/${userid}?grpid=${grpid}`, {headers: {"Authorization": token}});
    console.log(res);

}

async function removeuser(e) {
    const userid = e.target.id;
    const grpid = JSON.parse(localStorage.getItem('activegrpdetail')).id;
    const res = await axios.get(`http://localhost:3000/group/removeuser/${userid}?grpid=${grpid}`, {headers: {"Authorization": token}});
    console.log(res);
}

async function addtogroup(e) {
    e.preventDefault();
    const text = input.value;
    const groupmembers = JSON.parse(localStorage.getItem('groupmembers'));
    const users = JSON.parse(localStorage.getItem('users'));
    let userid;
    const grpid = JSON.parse(localStorage.getItem('activegrpdetail')).id
    users.forEach(user => {
        if(user.UserName == text) {
            for(let i=0; i<groupmembers.length; i++) {
                if(user.UserName == groupmembers[i].UserName) return alert('user already exist');
            }
            userid = user.id;
        }
    });
    if(!userid) return alert('user does not exist');
    const obj = {
        userId: userid,
        groupId: grpid
    }
    if(userid) {
        const res = await axios.post(`http://localhost:3000/group/adduser`,obj, {headers: {"Authorization": token}});
        console.log(res);
    }
}