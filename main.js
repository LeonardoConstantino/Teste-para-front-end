const btnCarrinho = document.querySelector('[data-Js="btn-carrinho"]')
const itensCarrinho = document.querySelector('[data-Js="itens-carrinho"]')

btnCarrinho.addEventListener("click", ()=>{
    itensCarrinho.classList.toggle("active")
    // itensCarrinho.classList.toggle("oculto")
})