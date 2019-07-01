App = {
  web3Provider : null,
  loading : false,
  contracts : {},
  account : '0x0',
  tokentransfered : 0,
  recievingAccount : '0x3EA899aF35c8ED173F2a5C15dD42CaD5B8B38088',
  
  
  init: function() {
  return App.initWeb3()
  },
  
  //initialize a web3 provider to link with a  =metamask account and do transaction
  initWeb3 : function() {
    if(typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3Provider = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3.currentProvider = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  
  //Get the contract instance from the json file that get's created when contract get's deployed
  initContract : function() {
    $.getJSON("TokenTransfer.json",function(tokentransfer){
    App.contracts.TokenTransfer = TruffleContract(tokentransfer);
    App.contracts.TokenTransfer.setProvider(App.web3Provider);
    App.eventListner();
    return App.render();
    })
  },

  //a event litsener function to call the event in the contract
  eventListner : function () {
    App.contracts.TokenTransfer.deployed().then(function(instance){
      instance.Transfer({},{
        fromBlock : 0,
        toBlock : 'latest'
      }).watch(function(error, event){
        console.log("Transfer Event Triggered : " + event)
        App.render();
      })
    })
  },
  
  //a function to display the content on ui after getting the account info and calling contract's methods
  render: function() {
    if(App.loading) {
      return;
    }
    App.loading = true;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
  
    web3.eth.getCoinbase(function(err,account){
      if(err == null) {
        App.account = account;
        $("#accountAddress").html("Your Account : " + App.account);
      }
    })
   App.contracts.TokenTransfer.deployed().then(function(instance){ 
     console.log(instance.balanceOf(instance.address))
     console.log(instance.balanceOf(App.account))
     return instance.tokenTransfered()
   }).then(function(tokens){
     console.log(tokens)
     App.tokenTransfered = tokens.toNumber();
     $(".tokens-transfered").html("Tokens Transfered : " + App.tokenTransfered)
     App.loading = false;
     loader.hide();
     content.show();
   })
  },
  //the transfer token function that get's called on click of a button
  trasferTokens : function() {
    $('#content').hide();
    $('#loader').show();
    var tokensToBeTransfered = $('#numberOfTokens').val();
    App.contracts.TokenTransfer.deployed().then(function(instance){
      return instance.transfer(App.recievingAccount,tokensToBeTransfered, {
        from : App.account,
        gas : 50000
      })
    }).then(function(tokens){
      console.log("Tokens bought...")
      App.eventListner()
    })
  }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });