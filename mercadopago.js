//Variables
var publicKey = //PUBLIC KEY DE MERCADOPAGO;
var bankSelect = document.querySelector('#bank');
var cardSelect = document.querySelector('#card');
var installmentsSelect = document.querySelector('#installments');
var calculateBtn = document.querySelector('#calculate');

//Load script
var loadScript = function(uri){
  return new Promise((resolve, reject) => {
    var tag = document.createElement('script');
    tag.src = uri;
    tag.async = true;
    tag.onload = () => {
      resolve();
    };
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
}

var scriptLoaded = loadScript('https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js');

scriptLoaded.then(function(){
  Mercadopago.setPublishableKey(publicKey);
  var paymentMethods = Mercadopago.getAllPaymentMethods(creditCards);
});

//Load cards
var creditCards = function(status, cards){
	var options='<option value="">Seleccionar tarjeta de credito</option>';
	if(cards.length > 0){
		cards.forEach(function(card){
			if (card.payment_type_id == 'credit_card' && card.status == 'active') {
				options += '<option value="'+card.id+'">'+card.name +'</option>';
			}
		});
	}
	cardSelect.innerHTML = options;
}

//Load issuers
var issuers = function(status, issuers){
	bankSelect.innerHTML = '';
	var options='<option value="">Seleccionar banco</option>';
	if(issuers.length > 0){
		bankSelect.removeAttribute('disabled');
		issuers.forEach(function(issuer){
				options += '<option value="'+issuer.id+'">'+ issuer.name +'</option>';
		});
	bankSelect.innerHTML = options;
	} else {
		bankSelect.setAttribute('disabled', '');
		Mercadopago.getInstallments({
		"payment_method_id": document.querySelector('#card').value,
		"amount": getAmount(),
		},getInstallments);
	}
}

//Get amount
var getAmount = function(){
	var amount = document.querySelector('#price').value;
	var qty = document.querySelector('#qty').value;
	var total = amount * qty;
	return total;
}

//Load installments
var getInstallments = function(status, installments){
	installmentsSelect.removeAttribute('disabled');
	var payer_costs = installments[0].payer_costs;
	var options = '<option value="">Seleccionar cuotas</option>';
	if (payer_costs.length > 0) {
		payer_costs.forEach(function(payer_cost){
			options += '<option value="' + payer_cost.installment_rate + '" data-installments="' + payer_cost.installments + '">' + payer_cost.installments + '</option>';
		});
	}
	document.querySelector('#installments').innerHTML = options;
}

//Calculate installments
var calculateInstallments = function () {
	var total = getAmount() * (1+(installmentsSelect.value/100));
	var installments = installmentsSelect.options[installmentsSelect.selectedIndex].getAttribute('data-installments');
	document.querySelector('#result').innerHTML = 'Paga en '+ installments + ' cuotas de $' + (total/installments).toFixed(2);
}

//ChangeHandler
var changeHandler = function(event){
	if(event.target === document.querySelector('#card')){
		return Mercadopago.getIssuers(document.querySelector('#card').value, issuers);
	}

	if(event.target === document.querySelector('#bank')){
		return Mercadopago.getInstallments({
		"payment_method_id": document.querySelector('#card').value,
		"issuer_id": event.target.value,
		"amount": getAmount(),
		},getInstallments);
	}
}

var clickHandler = function(event){
	if(event.target === calculateBtn){
	calculateInstallments();
	}

	if(event.target === cardSelect) {
		document.querySelector('#result').innerHTML = '';
	}

}

document.addEventListener('change', changeHandler);
document.addEventListener('click', clickHandler);