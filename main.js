const btnCarrinho = document.querySelector('[data-Js="btn-carrinho"]')
const itensCarrinho = document.querySelector('[data-Js="itens-carrinho"]')
const spamContagemItens = document.querySelector('[data-Js="contagem-itens"]')
const produtos = document.querySelector('[data-Js="produtos"]')
const dataItens = JSON.parse(localStorage.getItem('dataItens')) || {
    "produtos": []
}

const buscarDadosProdutos = async () => {
    const dados = await fetch("./src/data/data.json")
    const parseDados = await dados.json()
    return parseDados
}

const mostraSubTotal = (produtos) => {
    const subtotal = document.querySelector('[data-Js="subtotal"]')
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
    if(dataItens.produtos.length > 0){
        spamContagemItens.classList.remove("display-none")
        spamContagemItens.innerHTML = dataItens.produtos.length
    }
    // console.log(dataItens.produtos);
}

const mostrarProdutosCarrinho = () => {
    const {
        produtos
    } = dataItens
    if (produtos.length === 0) return
    produtos.forEach((produto, index) => {
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

        btnDelete.addEventListener("click", () => {
            // console.log("antes de apaga", produtos);
            divItemCarrinho.remove()
            produtos.splice(index, 1)
            // console.log("depois de apaga", produtos);
            localStorage.setItem("dataItens", JSON.stringify(dataItens))
            if (produtos.length === 0) {
                itensCarrinho.classList.remove("active")
                mostraSubTotal(produtos)
            }
            ContagemItens()
        })

        divItemCarrinho.appendChild(btnDelete)
        btnDelete.innerHTML = "X"
    })

    mostraSubTotal(produtos)

    // console.log("log mostrarProdutosCarrinho", produtos);
}
mostrarProdutosCarrinho()

const mostrarProdutosTela = async () => {
    const dados = await buscarDadosProdutos()
    const {
        items
    } = dados
    // console.log("log mostrarProdutosTela", items);

    const mediaPrecos = 
        items.reduce((acc, cur) => acc + cur.product.price.value, 0)/items.length
    // console.log(mediaPrecos);

    items.forEach(({
        product
    }, idx) => {
        const li = document.createElement("li")
        const {
            id,
            images,
            name,
            price
        } = product
        const {
            value,
            installments,
            installmentValue
        } = price
        const imgs = images.reduce((acc, cur, i) => {
            return i === 0 ?
                `<li class="select" data-img="pequena"><img src="${cur}" alt="${name}"></li>` :
                acc + `<li data-img="pequena"><img src="${cur}" alt="${name}"></li>`
        }, "")

        const melhorPreco = value > mediaPrecos? "display-none": ""

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
                                <input type="checkbox" class="input-coracao">
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

        const btnsAddCarrinho = document.querySelectorAll('[data-Js="add-carrinho"]')
        btnsAddCarrinho.forEach(btn => {
            btn.addEventListener("click", salvaItensCarrinho)
        });

        const lisImgsPequenas = li.querySelectorAll('[data-img="pequena"]')
        const imgGrande = li.querySelector('[data-img="grande"]')
        lisImgsPequenas.forEach(liImg => {
            liImg.addEventListener("click", (e) => {
                lisImgsPequenas.forEach(li => {
                    // console.log(li);
                    li.classList.remove("select")
                })
                e.target.parentElement.classList.add("select")
                imgGrande.src = e.target.src
                // console.log("cligey", e.target);
            })
        })
    })
}
mostrarProdutosTela()

const salvaItensCarrinho = async (e) => {
    const {
        items
    } = await buscarDadosProdutos()
    const {
        produtos
    } = dataItens
    const nomeProdutoClicado = e.path[3].dataset.nome
    const produtosNaTela = Array.from(itensCarrinho.querySelectorAll('[data-nome]'))
    if (produtos.length !== 0) {
        if (produtos.some(produto => produto.name === nomeProdutoClicado)) return
        // console.log("if salvaItensCarrinho", produtos);
    }
    if (produtosNaTela.some(a => a.dataset.nome === nomeProdutoClicado)) return
    const filter = items.filter(item => item.product.name === nomeProdutoClicado)
    const [{
        product
    } = index] = filter
    produtos.push(product)
    localStorage.setItem("dataItens", JSON.stringify(dataItens))
    mostrarProdutosCarrinho()
    ContagemItens()
    // console.log("log salvaItensCarrinho", dataItens);
}

btnCarrinho.addEventListener("click", () => {
    const {
        produtos
    } = dataItens
    if (produtos.length === 0) return
    itensCarrinho.classList.toggle("active")
})