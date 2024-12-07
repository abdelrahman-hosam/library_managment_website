const { redirect } = require("server/reply")

async function loginUser(){
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const data = {
        'username':username,
        'password':password
    }
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if(response.status === 200){
        window.location.href = "/homepage"
    }
    else{
        const info = await response.json()
        const card = document.getElementById('card')
        const err_msg = document.createElement('p')
        err_msg.innerText = info['error']
        err_msg.style.backgroundColor = 'black'
        err_msg.style.color = 'red'
        err_msg.style.padding = 20
        err_msg.style.borderRadius = 10
        card.appendChild(err_msg)
    }
    document.getElementById('username').value = ""
    document.getElementById('password').value = ""
}