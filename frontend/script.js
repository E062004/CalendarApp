let current=new Date();
let data={};
const userId=localStorage.getItem("userId");

const daysDiv=document.getElementById("days");
const grid=document.getElementById("grid");

const dayNames=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function key(y,m,d){return `${y}-${m}-${d}`}

// LOAD
async function load(){
  if(!userId){
    window.location="index.html";
    return;
  }

  const res=await fetch(`http://localhost:3000/data/${userId}`);
  data=await res.json();
  render();
}

// SAVE
async function save(){
  await fetch("http://localhost:3000/save",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({userId,data})
  });
}

// RENDER
function render(){
  const y=current.getFullYear();
  const m=current.getMonth();

  document.getElementById("title").innerText =
    current.toLocaleString("default",{month:"long"})+" "+y;

  daysDiv.innerHTML="";
  grid.innerHTML="";

  // day names
  dayNames.forEach(d=>{
    const el=document.createElement("div");
    el.className="dayname";
    el.innerText=d;
    grid.appendChild(el);
  });

  const first=new Date(y,m,1);
  const last=new Date(y,m+1,0).getDate();
  let start=(first.getDay()+6)%7;

  for(let i=0;i<start;i++) grid.appendChild(document.createElement("div"));

  for(let d=1;d<=last;d++){
    const k=key(y,m,d);

    // RIGHT PANEL
    const cell=document.createElement("div");
    cell.innerText=d;
    if(data[k]?.done) cell.classList.add("done");
    grid.appendChild(cell);

    // LEFT PANEL
    const row=document.createElement("div");
    row.className="day-row";

    const date=document.createElement("div");
    date.className="date";
    date.innerText=`Day ${d}`;

    const tasks=document.createElement("div");
    tasks.className="tasks";

    if(!data[k]){
      const btn=document.createElement("div");
      btn.className="add-btn";
      btn.innerText="+";

      btn.onclick=()=>{
        const inp=document.createElement("input");

        inp.onkeypress=(e)=>{
          if(e.key==="Enter" && inp.value.trim()){
            data[k]={text:inp.value,done:false};
            save();
            render();
          }
        };

        tasks.innerHTML="";
        tasks.appendChild(inp);
        inp.focus();
      };

      tasks.appendChild(btn);

    } else {
      const task=document.createElement("div");
      task.className="task";

      const cb=document.createElement("input");
      cb.type="checkbox";
      cb.checked=data[k].done;

      const span=document.createElement("span");
      span.innerText=data[k].text;
      if(data[k].done) span.classList.add("completed");

      cb.onchange=()=>{
        data[k].done=cb.checked;
        save();
        render();
      };

      // EDIT BUTTON
      const edit=document.createElement("button");
      edit.innerText="✏️";
      edit.style.border="none";
      edit.style.background="transparent";
      edit.style.cursor="pointer";

      edit.onclick=()=>{
        const inp=document.createElement("input");
        inp.value=data[k].text;

        inp.onkeypress=(e)=>{
          if(e.key==="Enter"){
            data[k].text=inp.value;
            save();
            render();
          }
        };

        task.innerHTML="";
        task.appendChild(cb);
        task.appendChild(inp);
        inp.focus();
      };

      task.appendChild(cb);
      task.appendChild(span);
      task.appendChild(edit);

      tasks.appendChild(task);
    }

    row.appendChild(date);
    row.appendChild(tasks);
    daysDiv.appendChild(row);
  }
}

// MENU
function toggleMenu(){
  const d=document.getElementById("dropdown");
  d.style.display = d.style.display==="block"?"none":"block";
}

// LOGOUT
function logout(){
  localStorage.removeItem("userId");
  window.location="index.html";
}

// NAV
function nextMonth(){current.setMonth(current.getMonth()+1);render();}
function prevMonth(){current.setMonth(current.getMonth()-1);render();}

load();
