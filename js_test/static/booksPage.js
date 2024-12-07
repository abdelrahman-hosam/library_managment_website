var book_opts = false , author_opts = false , author_card = null
var last_id = null
async function showBooks(){
    const response = await fetch('/api/books/show', {
        method:'GET',
        headers:{
            'content-type':'application/json'
        }
    })
    if(response.status === 200){
        const res = await response.json()
        const books = res['books']
        const card = document.getElementById('books-results')
        for(const book of books){
            const results_cards = document.createElement('div')
            results_cards.style.border = '1px solid black'
            results_cards.style.padding = '10px'
            results_cards.style.marginTop = '10px'
            const book_title = document.createElement('p')
            const book_id = document.createElement('p')
            book_title.innerText = book['book_title']
            book_id.innerText = book['id']
            results_cards.appendChild(book_title)
            results_cards.appendChild(book_id)
            card.appendChild(results_cards)
        }
    }
}
function bookOpts(){
    if(!book_opts){
        const data = []
        const sub_options = document.getElementById('sub-opts')
        sub_options.replaceChildren()
        const opts = ['add' , 'search', 'show','borrow']
        for(var i = 0 ; i < 4 ; i++){
            const button = document.createElement('button')
            button.innerText = opts[i]
            button.setAttribute('id' , opts[i])
            button.setAttribute('onclick' , 'book_cards(this.id)')
            if(opts[i] === 'show') button.setAttribute('onclick' , 'showBooks()')
            sub_options.append(button)
        }
        book_opts = true 
        author_opts = false
    }
}
function authorOpts(){
    if(!author_opts){
        const sub_options = document.getElementById('sub-opts')
        sub_options.replaceChildren()
        const opts = ['add', 'search', 'wrote']
        for(var i = 0 ; i < 3 ; i++){
            const button = document.createElement('button')
            button.innerText = opts[i]
            button.setAttribute('id' , opts[i])
            button.setAttribute('onclick' , 'author_cards(this.id)')
            sub_options.append(button)
        }
        book_opts = false 
        author_opts = true
    }
}
async function add(){
    const book_title = document.getElementById('book-title').value
    const des = document.getElementById('description').value
    const date = document.getElementById('published-at').value
    const authors = document.getElementById('authors-wrote').value
    const genres = document.getElementById('generes').value
    const authors_array = authors.split(' ')
    const generes_array = genres.split(' ')
    const data = {
        'book_title': book_title,
        'description': des,
        'published_at': date,
        'authors': authors_array,
        'genres': generes_array
    }
    const response = await fetch('/api/books/add' , {
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    if(response.status === 200){
        const card = document.getElementById('add-card')
        const msg = document.createElement('p')
        msg.innerText = 'book was added successfully'
        card.appendChild(msg)
    }
    else{
        const card = document.getElementById('add-card')
        const msg = document.createElement('p')
        msg.innerText = 'something went wrong'
        card.appendChild(msg)
    }
}
function author_cards(id){
    if(last_id){
        if(author_card){
            const last_card = document.getElementById(`author-${last_id}-card`)
            last_card.style.display = 'none'
        }
        else{
            const last_card = document.getElementById(`${last_id}-card`)
            last_card.style.display = 'none'
        }
    }
    author_card = true
    const card = document.getElementById(`author-${id}-card`)
    card.style.display = 'block'
    last_id = id
    const books_results = document.getElementById('books-results')
    const search_results = document.getElementById('book-search-result')
    books_results.innerText = ''
    search_results.innerText = ''
}
function book_cards(id){
    if(last_id){
        if(last_id[1] === 'u'){
            const last_card = document.getElementById(`author-${last_id}-card`)
            last_card.style.display = 'none'
        }
        else{
            const last_card = document.getElementById(`${last_id}-card`)
            last_card.style.display = 'none'
        }
    }
    author_card = false
    const card = document.getElementById(`${id}-card`)
    card.style.display = 'block'
    last_id = id
    const books_results = document.getElementById('books-results')
    const search_results = document.getElementById('book-search-result')
    books_results.innerText = ''
    search_results.innerText = ''
}
async function searchFor(){
    const search_query = document.getElementById('search-query').value
    const titles = search_query.split(' ')
    if(search_query){
        data = {
            'titles': titles
        }
        const response = await fetch('/api/books/search' , {
            method:'POST',
            headers:{
                'content-type':'application/json'
            },
            body: JSON.stringify(data)
        })
        if(response.status === 200){
            const search_result = await response.json()
            const results = search_result['book']
            if(results.length === 0){
                const msg = document.createElement('p'),
                card = document.getElementById('search-card')
                msg.innerText = 'we could not find the book you want'
                card.appendChild(msg)
            }
            const card = document.getElementById('search-card')
            for(const result of results){
                const book_card = document.createElement('div'),
                book_title = document.createElement('p'),
                book_id = document.createElement('p')
                book_card.style.border = '1px solid black'
                const title = result['book_title']
                const id = result['id']
                book_title.innerText = title
                book_id.innerText = id
                book_card.appendChild(book_title)
                book_card.appendChild(book_id)
                card.appendChild(book_card)
            }
        }
        else{
            const msg = document.createElement('p'),
            card = document.getElementById('search-card')
            msg.innerText = 'something went wrong'
            card.appendChild(msg)
        }
    }
}
async function borrow(){
    const id = document.getElementById('book-id').value
    const data = {
        'id': id
    }
    const response = await fetch('/api/books/borrow' ,{
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    const card = document.getElementById('borrow-card')
    const msg = document.createElement('p')
    if(response.status === 200){
        msg.innerText = 'book was borrowed successfully'
        card.appendChild(msg)   
    }
    else{
        msg.innerText = 'something went wrong'
        card.appendChild(msg)   
    }
}
async function addAuthor(){
    const username = document.getElementById('author-username').value
    const bio = document.getElementById('bio').value
    const data = {
        'username':username,
        'bio':bio
    }
    const response = await fetch('/api/authors/add', {
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    const msg = document.createElement('p')
    if(response.status === 200){
        const card = document.getElementById('author-add-card')
        msg.innerText = 'author was successfully added'
        card.appendChild(msg)
    }
    else{
        const card = document.getElementById('author-add-card')
        msg.innerText = 'something went wrong'
        card.appendChild(msg)
    }
}
async function searchAuthor(){
    const author_id = document.getElementById('author-search-id').value
    const author_username = document.getElementById('author-search-username').value
    const data = {
        'id':author_id,
        'username': author_username
    }
    const response = await fetch('/api/authors/search' , {
        method:'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    if(response.status === 200){
        const res = await response.json()
        const results = res['author']
        const parent = document.getElementById('author-search-card')
        for(const result of results){
            const search_parent = document.createElement('div')
            search_parent.style.border = '1px solid black'
            search_parent.style.textAlign = 'left'
            search_parent.style.marginTop = '20px'
            const username = result['username']
            const bio = result['bio']
            const username_search = document.createElement('p')
            const bio_search = document.createElement('p')
            bio_search.innerText = `author bio: ${bio}`
            username_search.innerText = `author username: ${username}`
            search_parent.appendChild(username_search)
            search_parent.appendChild(bio_search)
            parent.appendChild(search_parent)
        }
    }
    else{
        const card = document.getElementById('author-search-card')
        const msg = document.createElement('p')
        msg.innerText = 'something went wrong'
        card.appendChild(msg)
    }
}
async function booksWrote(){
    const author_id = document.getElementById('author-wrote-id').value
    const data = {
        'id':author_id
    }
    const response = await fetch('/api/authors/wrote' , {
        method: 'POST',
        headers:{
            'content-type':'application/json'
        },
        body: JSON.stringify(data)
    })
    if(response.status === 200){
        const res = await response.json()
        const results = res['books']
        const parent = document.getElementById('author-wrote-card')
        if(typeof(results) === 'string'){
            const msg = document.createElement('p')
            msg.innerText = results
            parent.appendChild(msg)
        }
        else{
            for(const result of results){
                const result_parent = document.createElement('div')
                const result_child = document.createElement('p')
                result_child.innerText = `book title: ${result}`
                result_parent.appendChild(result_child)
            }
        }
    }
    else{
        const parent = document.getElementById('author-wrote-card')
        const msg = document.createElement('p')
        msg.innerText = 'something went wrong'
        parent.appendChild(msg)
    }
}