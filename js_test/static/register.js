async function registerUser(){
    const username = document.getElementById('username').value,
    password = document.getElementById('password').value
    const data = {
        'username':username,
        'password':password
    }
    const response = await fetch('/api/register' ,{
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    if (response.status !== 201){
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
    else{
        const info = await response.json()
        const card = document.getElementById('card')
        const err_msg = document.createElement('p')
        err_msg.innerText = 'user successfully created'
        err_msg.style.backgroundColor = 'green'
        err_msg.style.color = 'black'
        err_msg.style.padding = 20
        err_msg.style.borderRadius = 10
        card.appendChild(err_msg)
    }
}