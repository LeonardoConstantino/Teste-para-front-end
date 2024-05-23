const btnCarrinho = document.querySelector('[data-Js="btn-carrinho"]')
const itensCarrinho = document.querySelector('[data-Js="itens-carrinho"]')
const subtotal = document.querySelector('[data-Js="subtotal"]')
const spamContagemItens = document.querySelector('[data-Js="contagem-itens"]')
const produtos = document.querySelector('[data-Js="produtos"]')
const dataItens = JSON.parse(localStorage.getItem('dataItens')) || {
    "produtos": []
}
const itensGostei = JSON.parse(localStorage.getItem('itensGostei')) || {
    "itens": []
}
const url = "./src/data/data.json"

const buscarDadosProdutos = async (url) => {
    const dados = await fetch(url)
    const parseDados = await dados.json()
    return parseDados
}

const salvaLocalStorage = (nome, item) => {
    localStorage.setItem(nome, JSON.stringify(item))
}

const mostraSubTotal = (produtos) => {
    if (produtos.length === 0) {
        subtotal.innerHTML = "Carrinho vazino"
        return
    }

    const total = produtos.reduce((acc, cur) => acc + cur.price.value, 0)
    const valorParcela = total / produtos[0].price.installments

    subtotal.innerHTML = `
    <p>subtotal</p>
    <hr>
    <p><span>${produtos[0].price.installments}</span> R$ <span>${valorParcela.toFixed(2)}</span></p>
    <p>ou R$ <span>${total.toFixed(2)}</span> à vista</p>
`
}

const ContagemItens = () => {
    spamContagemItens.classList.add("display-none")
    if (dataItens.produtos.length > 0) {
        spamContagemItens.classList.remove("display-none")
        spamContagemItens.innerHTML = dataItens.produtos.length
    }
}

const mostrarProdutosCarrinho = () => {
    const {
        produtos
    } = dataItens
    if (produtos.length === 0) return

    const criaHTMLProdutoCarrinho = (produto, arr) => {
        const produtosNaTela = Array.from(itensCarrinho.querySelectorAll('[data-nome]'))
        if (produtosNaTela.some(a => a.dataset.nome === produto.name)) return

        const divItemCarrinho = document.createElement("div")
        const btnDelete = document.createElement("button")

        itensCarrinho.appendChild(divItemCarrinho)
        divItemCarrinho.classList.add("item-carrinho")
        divItemCarrinho.setAttribute("data-nome", produto.name)
        btnDelete.classList.add("anima-btn")

        divItemCarrinho.innerHTML = `
            <div>
                <div class="img-carrinho">
                    <img src="${produto.images[0]}" alt="${produto.name}">
                </div>
                <div class="descricao">
                    <h3><a href="#">${produto.name}</a></h3>
                    <div class="valor-carrinho">
                        <p><span class="quantidade-parcela-carrinho">${produto.price.installments}</span>x R$ <span
                                class="valor-parcelado-carrinho">${produto.price.installmentValue}</span></p>
                        <p>ou <span class="valor-avista-carrinho">R$ ${produto.price.value}</span> a vista</p>
                    </div>
                </div>
            </div>
        `

        divItemCarrinho.appendChild(btnDelete)
        btnDelete.innerHTML = "X"

        function removeItemCLicadoDoCarrinho() {
            divItemCarrinho.remove()
            produtos.splice(arr.indexOf(produto), 1)
            salvaLocalStorage("dataItens", dataItens)
            if (produtos.length === 0) {
                itensCarrinho.classList.remove("active")
                mostraSubTotal(produtos)
            }
            ContagemItens()
        }

        btnDelete.addEventListener("click", removeItemCLicadoDoCarrinho)
    }
    produtos.forEach((produto, _, arr) => criaHTMLProdutoCarrinho(produto, arr))

    mostraSubTotal(produtos)
}
mostrarProdutosCarrinho()

const mostrarProdutosTela = async () => {
    const dados = await buscarDadosProdutos(url)
    const {
        items
    } = dados

    const {
        itens
    } = itensGostei

    const mediaPrecos =
        items.reduce((acc, cur) => acc + cur.product.price.value, 0) / items.length

    const criaHTMLCardProdutos = product => {
        const li = document.createElement("li")
        const {
            images,
            name,
            price
        } = product
        const {
            value,
            installments,
            installmentValue
        } = price

        const gostei = itens.includes(name) ? "checked" : ""

        const imgs = images.reduce((acc, cur, i) => {
            return i === 0 ?
                `<li class="select" data-img="pequena"><img src="${cur}" alt="${name}"></li>` :
                acc + `<li data-img="pequena"><img src="${cur}" alt="${name}"></li>`
        }, "")

        const melhorPreco = value > mediaPrecos ? "display-none" : ""

        li.innerHTML = `
            <div class="produto" data-nome="${name}">
                <ul class="imagens-produto">
                    ${imgs}
                </ul>
                <div class="imagen-produto">
                    <img src="${images[0]}" alt="${name}" data-img="grande">
                </div>
                <div class="detalhes">
                    <div class="titulo-produto">
                        <div>
                            <a href="#">${name}</a>
                            <label class="label-coracao anima-btn">
                                <input type="checkbox" class="input-coracao" data-inputCoracao="${name}" ${gostei}>
                                <i class="coracao">
                                    <span></span>
                                    <span></span>
                                </i>
                            </label>
                        </div>
                    </div>
                    <hr>
                    <p class="melhor-preco ${melhorPreco}">melhor preço</p>
                    <div class="valor">
                        <div>
                            <p><span class="quantidade-parcela">${installments}x R$ </span><span
                                    class="valor-parcelado">${installmentValue}</span></p>
                            <p>ou <span class="valor-avista">R$ ${value}</span> a vista</p>
                        </div>
                        <button class="add-carrinho anima-btn" data-Js="add-carrinho">Adicionar ao carrinho ></button>
                    </div>
                </div>
            </div>
        `
        produtos.appendChild(li)
    };

    items.forEach(({
        product
    }) => criaHTMLCardProdutos(product))

    const btnsAddCarrinho = document.querySelectorAll('[data-Js="add-carrinho"]')
    btnsAddCarrinho.forEach(btn =>
        btn.addEventListener("click", salvaItensCarrinho)
    )

    const lisImgsPequenas = document.querySelectorAll('[data-img="pequena"]')
    const imgGrande = document.querySelector('[data-img="grande"]')

    const adicionaEventoMostraImgClicadaMaior = liImg => {
        const mostraImgClicadaMaior = e => {
            lisImgsPequenas.forEach(li => li.classList.remove("select"))
            e.target.parentElement.classList.add("select")
            imgGrande.src = e.target.src
        }

        liImg.addEventListener("click", (e) => mostraImgClicadaMaior(e))
    }

    lisImgsPequenas.forEach(liImg => adicionaEventoMostraImgClicadaMaior(liImg))

    const inputsCoracao = document.querySelectorAll('[data-inputCoracao]')

    const adicionaEventoSalvaItemComGostei = (input) => {
        const salvaItensComGostei = (e) => {
            const nomeItem = e.target.dataset.inputcoracao
            const gostei = e.target.checked

            if (gostei) itens.push(nomeItem)
            if (!gostei) itens.splice(itens.indexOf(nomeItem), 1)

            salvaLocalStorage("itensGostei", itensGostei)
        }

        input.addEventListener("change", e => salvaItensComGostei(e))
    }

    inputsCoracao.forEach(input => adicionaEventoSalvaItemComGostei(input))
}
mostrarProdutosTela()

const salvaItensCarrinho = async (e) => {
    const {
        items
    } = await buscarDadosProdutos(url)
    const {
        produtos
    } = dataItens
    const ItensCarrinho = produtos.map((produto) => produto.name)
    const nomeProdutoClicado = e.target.parentElement.parentElement.parentElement.dataset.nome
    const filter = items.filter(item => item.product.name === nomeProdutoClicado)
    const [{
        product
    } = index] = filter
    if (ItensCarrinho.includes(nomeProdutoClicado)) return
    produtos.push(product)
    salvaLocalStorage("dataItens", dataItens)
    mostrarProdutosCarrinho()
    ContagemItens()
}

const abreCarrinho = () => {
    const {
        produtos
    } = dataItens
    if (produtos.length === 0) {
        subtotal.innerHTML = "Carrinho vazio"
    }
    itensCarrinho.classList.toggle("active")
}

btnCarrinho.addEventListener("click", abreCarrinho)
ContagemItens()
