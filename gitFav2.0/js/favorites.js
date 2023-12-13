import { GithubUser } from "./githubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@gitFav:')) || []
    }

    save() {
        localStorage.setItem('@gitFav:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find( entry => entry.login === username)

            if(userExists) {
               throw new Error('Usuário já cadastrado.')
            }


            const user = await GithubUser.search(username)
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado... tente novamente!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
    }
}



export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')
        this.update()
        this.onadd()
    }

    checkIfEmpty() {
        if(this.entries.length === 0) {
            this.root.querySelector(".no-gitFav").classList.remove("hidden")
        } else {
            this.root.querySelector(".no-gitFav").classList.add("hidden")
        }
    }
    
    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
           
            this.add(value)
        }
    }

    update() {
        this.removeAllTr()
        this.checkIfEmpty()

        this.entries.forEach((user) => {
            const row = this.createRow()
            
            row.querySelector('.user img').alt = `Foto de ${user.name}`
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').innerHTML = user.followers

            row.querySelector('.remove').onclick = () => {
               const isOk = confirm('Realmente deseja deletar este usuário?')
               if(isOk) {
                this.delete(user)
               }
            }

            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <td class="user">
            <img src="https://github.com/almirfranca.png" alt="Foto de almirfranca">
            <a href="https://github.com/almirfranca" target="_blank">
                <p>Almir França</p>
                <span>/almirfranca</span>
            </a>
        </td>
        <td class="repositories">11</td>
        <td class="followers">100</td>
        <td class="lasTd">
            <button class="remove">Remove</button>
        </td>
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
        .forEach((tr) => {
            tr.remove()
        })
    }
}