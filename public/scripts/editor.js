const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};
// invoke this function when the page loads:
initResetButton();

const attachEventHandlers = () => {
    // once the unordered list has been attached to the DOM
    // (by assigning the #artists container's innerHTML),
    // you can attach event handlers to the DOM:
    document.querySelectorAll('#all_doctors a').forEach(a => {
        a.onclick = showDetail;        
    });
};

// global variable
var selected_id;
var selected_doctor;
const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;
    selected_id = id;
    // find the current doctor from the doctor array:
    selected_doctor = doctors.filter(selected_doctor => selected_doctor._id === id)[0];
    // collect all infor for current doctor for autofill of edit button
    // show doctor name, imgm and seasons in middle panel
    document.querySelector('#doctor').innerHTML = `
    <div id="doctor_info">
        <button onclick="delFn()" class="btn" id="del_btn">Delete</button>
        <button onclick="editFn()" class="btn btn-main" id="edit_btn">Edit</button>    
        <h2>${selected_doctor.name}</h2>
        <img src="${selected_doctor.image_url}" width="300" height="500">
        <br>
        <p>Seasons: ${selected_doctor.seasons}</p>
    </div>
    `;
        //document.getElementById("edit_btn").addEventListener("click", editFn());
        
    // find the companions
    fetch('/doctors/' + selected_id + '/companions')
    .then(request => request.json())
    .then( comp_data =>{
        companions = comp_data;
        const listComps = comp_data.map(companion => 
            `
            <li><p class="c" id="comp_name">${companion.name}</p></li>
            <li><img class="c" id="comp_img" src="${companion.image_url}" width="100" height=120"></li>`
            );
        document.querySelector('#companions').innerHTML = `
        <div id="companions_info">
        <ul>
            ${listComps.join('')}
            <br>
        </ul>
        </div>`

    });
}
    
// EDIT DOCTOR form
function editFn(){
    // autofill form for selected doctor
    document.querySelector('#doctor').innerHTML = `
        <form id="new_doc_form">
            <!-- Name -->   
            <label for="name">Name</label>
            <input type="text" id="name" value="${window.selected_doctor.name}">

            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <input type="text" id="seasons" value=${window.selected_doctor.seasons}>

            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <input type="text" id="ordering" value=${window.selected_doctor.ordering}>

            <!-- Image -->
            <label for="image_url">Image</label>
            <input type="text" id="image_url" value=${window.selected_doctor.image_url}>

            <!-- Buttons -->
            <button onclick="updateFn()" class="btn btn-main" id="update">Save</button>
            <button onclick="hideFn()" class="btn" id="cancel">Cancel</button>
        </form>`
    }

// EDIT DOCTOR function (PATCH)
function updateFn() {
    //console.log("update_name", update_name)
    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        image_url: document.getElementById('image_url').value,
        ordering: document.getElementById('ordering').value
    }

    fetch('/doctors/' + window.selected_doctor._id, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                console.log("patch is success")
                return response.json();
            }
        })
        // after creating new doctor, show the new doctor in selected doctor panel 
        .then(data => {
            console.log('Success:', data);
            // update global var selected_doctor to updated
            document.querySelector('#doctor').innerHTML = `
            <div id="doctor_info">
                <button onclick="delFn()" class="btn" id="del_btn">Delete</button>
                <button onclick="editFn()" class="btn btn-main" id="edit_btn">Edit</button>   
                <h2>${data.name}</h2>
                <img src="${data.image_url}" width="300" height="500">
                <br>
                <p>Seasons: ${data.seasons}</p>
            </div>
            `
        // TODO: must also update the left-hand panel


        // selected_doctor = data;
        // console.log('selected doctor', selected_doctor)

        // have to find the selected_doctor within doctors array
        // selected_doctor = doctors.filter(doctor => doctor._id === id)[0]

        let docToReplace = doctors.filter(doctor => doctor._id === selected_doctor._id)[0]
        // console.log(docToReplace)
        let index = docToReplace.ordering - 1

        doctors[index] = data;
        // console.log('doctors[index]', doctors[index])

        // docToReplace = data;
        // console.log('hopefully the updated one', docToReplace)

        const listItems = doctors.map(doctor => `
        <li>
            <a href="#" data-id="${doctor._id}">${doctor.name}</a>
        </li>`
        );
        console.log("list items after editing", listItems)

        // putting all elements of doctors in a list
        document.getElementById('all_doctors').innerHTML = `
        <ol>
        ${listItems.join('')}
        </ol>
        <button onclick="showFn()" class="btn">Add New Doctor</button>`
    })

///
        .catch(err => {
        console.error(err);
        alert('Entries are not valid. Please enter fields in the correct formats!');
        })
        .then(attachEventHandlers);
    // now that the doctor was updated, have to update the middle panel

    }  


function hideFn() {
    var x = document.getElementById("new_doc_form");
    x.style.display = "none";
    document.getElementById("companions_info").style.display = "none"

}

function showFn() {
    if(document.getElementById("companions_info") != null){
        document.getElementById("companions_info").style.display = "none"
    };
    var x = document.getElementById("new_doc_form");
    if(x != null){
        x.style.display = "block";
    }
   else{
        document.querySelector('#doctor').innerHTML = `
            <form id="new_doc_form">
                <!-- Name -->
                <label for="name">Name</label>
                <input type="text" id="name">

                <!-- Seasons -->
                <label for="seasons">Seasons</label>
                <input type="text" id="seasons">

                <!-- Ordering -->
                <label for="ordering">Ordering</label>
                <input type="text" id="ordering">

                <!-- Image -->
                <label for="image_url">Image</label>
                <input type="text" id="image_url">

                <!-- Buttons -->
                <button onclick="createFn()" class="btn btn-main" id="create">Add</button>
                <button onclick="hideFn()" class="btn" id="cancel">Cancel</button>
            </form>`
    }
}

function createFn() {
    document.getElementById("companions_info").style.display = "none"

    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        ordering: document.getElementById('ordering').value,
        image_url: document.getElementById('image_url').value
    }
    fetch('/doctors', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                return response.json();
            }
        })
        // after creating new doctor, show the new doctor in selected doctor panel 
        .then(data => {
            console.log('Success:', data);
            new_doc = data
            // update global var current doc
            window.selected_doctor = new_doc;
            document.querySelector('#doctor').innerHTML = `
            <div id="doctor_info">
                <button onclick="delFn()" class="btn" id="del_btn">Delete</button>
                <button onclick="editFn()" class="btn btn-main" id="edit_btn">Edit</button>   
                <h2>${new_doc.name}</h2>
                <img src="${new_doc.image_url}" width="300" height="500">
                <br>
                <p>Seasons: ${new_doc.seasons}</p>
            </div>
                `;
            doctors.push(new_doc)
            const listItems = doctors.map(doctor => `
            <li>
                <a href="#" data-id="${doctor._id}">${doctor.name}</a>
            </li>`
            );
            document.getElementById('all_doctors').innerHTML = `
            <button onclick="showFn()" class="btn">Add New Doctor</button>    
            <ul id=all_doc_list>
                    ${listItems.join('')}
                    <br>
                </ul>`
        })
        .catch(err => {
            console.error(err);
            alert('Entries are not valid. Please enter fields in the correct formats!');
        })
        .then(attachEventHandlers);
        
};  

// 5: delete a doctor
// confirmation message: ask if whether they're sure they want to delete

function delFn() {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
        // if user says "OK", issue delete request to /doctors/:id
        fetch('/doctors/' + selected_doctor._id, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block
                throw Error(response.statusText);
            } else {
                return response.text()
            }
        })
        // now hiding both middle and right detail panels
        .then(data => {
            console.log('tis deleted', data);
            console.log('cancelling form')
            var x = document.getElementById("doctor_info");
            x.style.display = "none";

            document.getElementById("companions_info").style.display = "none"
            
        })
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
        // .then(attachEventHandlers);
        // TODO: redraw left-hand panel



        // if user cancels, TODO: do we really need the else statement below?
    }
    else {
        console.log('im here now')
        document.querySelector('#doctor').innerHTML = `
        <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
        <button onclick="deleteDoctor()" class="btn btn-main" id="delete_btn">delete</button>
        <h2> ${data.name}</h2>
        <img src="${data.image_url}" width="400px" />
        <br>
        <p>Seasons: ${data.seasons}</p>
        `;
    
    }

        }


// fetch all existing doctors info from database
let doctors;
fetch('/doctors')
    .then(request => request.json())
    // all retireved data stored in global variable called doctors
    .then(data => {
        doctors = data
        const listItems = data.map(doctor => `
        <li>
            <a href="#" data-id="${doctor._id}">${doctor.name}</a>
        </li>`
        );
        // display all doctors in left panel
        document.getElementById('all_doctors').innerHTML = `
            <button onclick="showFn()" class="btn">Add New Doctor</button>
            <ul id=all_doc_list>
                ${listItems.join('')}
                <br>
            </ul>
            `
    })
    // call helper functions to display name, img, seasons of selected doc
    .then(attachEventHandlers);




