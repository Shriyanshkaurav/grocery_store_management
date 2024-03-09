var productPrices = {};

$(function () {
    //Json data by api call for order table
    $.get(productListApiUrl, function (response) {
        productPrices = {}
        if(response) {
            var options = '<option value="">--Select--</option>';
            $.each(response, function(index, product) {
                options += '<option value="'+ product.product_id +'">'+  product.product_name +'</option>';
                productPrices[product.product_id] = product.price_per_unit;
            });
            $(".product-box").find("select").empty().html(options);
        }
    });
});

$("#addMoreButton").click(function () {
    var row = $(".product-box").html();
    $(".product-box-extra").append(row);
    $(".product-box-extra .remove-row").last().removeClass('hideit');
    $(".product-box-extra .product-price").last().text('0.0');
    $(".product-box-extra .product-qty").last().val('1');
    $(".product-box-extra .product-total").last().text('0.0');
});

$(document).on("click", ".remove-row", function (){
    $(this).closest('.row').remove();
    calculateValue();
});

$(document).on("change", ".cart-product", function (){
    var product_id = $(this).val();
    var price = productPrices[product_id];

    $(this).closest('.row').find('#product_price').val(price);
    calculateValue();
});

$(document).on("change", ".product-qty", function (e){
    calculateValue();
});

$("#saveOrder").on("click", function(){
    var formData = $("form").serializeArray();
    var requestPayload = {
        customer_name: null,
        grand_total: null,
        order_details: []
    };
    
    var lastElement = null; // Initialize lastElement outside the loop

    for(var i=0; i<formData.length; ++i) {
        var element = formData[i];

        switch(element.name) {
            case 'customerName':
                requestPayload.customer_name = element.value;
                break;
            case 'product_grand_total':
                requestPayload.grand_total = element.value;
                break;
            case 'product':
                // Initialize lastElement for each product
                lastElement = {
                    product_id: element.value,
                    quantity: null,
                    total_price: null
                };
                requestPayload.order_details.push(lastElement);
                break;
            case 'qty':
                // Ensure lastElement is defined before setting quantity
                if (lastElement) {
                    lastElement.quantity = element.value;
                }
                break;
            case 'item_total':
                // Ensure lastElement is defined before setting total_price
                if (lastElement) {
                    lastElement.total_price = element.value;
                }
                break;
        }
    }+
    callApi("POST", orderSaveApiUrl, {
        'data': JSON.stringify(requestPayload)
    });
});