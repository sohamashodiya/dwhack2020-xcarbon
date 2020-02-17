console.log('START');

var store = {
  state: {
    progressShow: false
  }
}

const Home = Vue.component('Home', {
  template: '#home-template',
  data: function() {
    return {
      state: store.state,
    }
  },
  methods: {},
  mounted() {
    console.log('Home mounted');
  },
  created() {
    console.log('Home created');
  }
})

const UserDashboard = Vue.component('UserDashboard', {
  template: '#userDashboard-template',
  data: function() {
    return {
      state: store.state,
    }
  },
  methods: {},
  mounted() {
    console.log('User Dashboard mounted');
  },
  created() {
    console.log('User Dashboard created');
  }
})

const GovDashboard = Vue.component('GovDashboard', {
  template: '#govDashboard-template',
  data: function() {
    return {
      state: store.state,
      mapSrcArray: [
        {src: "https://i.imgur.com/WVHFuW0.png"},
        {src: "https://i.imgur.com/12lXLPI.png"},
        {src: "https://i.imgur.com/rwN9cUV.png"},
        {src: "https://i.imgur.com/XJjKvWd.png"},
      ],
      currentMapSrc: "https://i.imgur.com/hY5dWLF.png",
      value: [0, 2, 5, 9, 5, 10, 3, 5, -4, -10, 1, 8, 2, 9, 0]
    }
  },
  methods: {},
  mounted() {
    var i = 0;
    var timer = setInterval(() => { 
      if (i < this.mapSrcArray.length) {
        this.currentMapSrc = this.mapSrcArray[i].src;
        i++;  
      } else {
        clearInterval(timer);
      }
    }, 2000);
    
    console.log('Gov Dashboard mounted');
  },
  created() {
    console.log('Gov Dashboard created');
  }
})

const LoginUser = Vue.component('LoginUser', {
  template: '#loginUser-template',
  data: function() {
    return {
      state: store.state,
      loginUserDetails: {
        email: 'soham@sss.com',
        password: 's',
        type: 'user'
      }
    }
  },
  methods: {
    submit: async function() {
      console.log('Logging in ' + JSON.stringify(this.loginUserDetails));

      const response = await fetch('/api/loginUser', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ loginUserDetails: this.loginUserDetails })
      }).then(r => r.json());

      // console.log("RESPONSE FOR LOGIN", response);
      console.log("Login user", response);

      store.state.user = response.results.user;
      store.state.accountInfo = response.results.accountInfo;

      router.push({ path: '/userDashboard' });
    }
  },
  mounted() {
    console.log('Login User mounted');
  },
  created() {
    console.log('Login User created');
  }
})

const LoginGov = Vue.component('LoginGov', {
  template: '#loginGov-template',
  data: function() {
    return {
      state: store.state,
      loginGovDetails: {
        name: 'City of New York',
        email: 'cityofnyc@ny.com',
        password: '',
        type: 'gov'
      }
    }
  },
  methods: {
    submit: function() {
      console.log('Logging in ' + JSON.stringify(this.loginGovDetails));
      store.state.user = this.loginGovDetails;

      router.push({ path: '/govDashboard' });
    }
  },
  mounted() {
    console.log('Login Gov mounted');
  },
  created() {
    console.log('Login Gov created');
  }
})

const RegisterUser = Vue.component('RegisterUser', {
  template: '#registerUser-template',
  data: function() {
    return {
      state: store.state,
      registerUserDetails: {
        name: 's',
        email: 'xyz@sss.com',
        password: 's',
        address: 's',
        mneumonic: 's',
        deviceId: 's',
        type: 'user'
      },
      loginProgress: [
        "Creating user Account on Algorand chain...",
        "Setting up account to receive Carbos...",
        "Creating user in XCarbon system...",
        "Congratulations, you are registered!"
      ],
      progressIndex: 0
    }
  },
  methods: {
    testProgress(){
      this.startProgress();
    },
    startProgress(){
      console.log('Starting Progress...');
      var timer = setInterval(() => {
        console.log("this.progressIndex, this.loginProgress.length", this.progressIndex, this.loginProgress.length);
        this.progressIndex++;
        if(this.progressIndex > this.loginProgress.length - 1){
          console.log('Ending Progress timer. this.progressIndex = ', this.progressIndex, this.loginProgress.length);
          clearInterval(timer);
        }
      }, 1500);
    },
    submit: async function() {
      this.startProgress();
      store.state.progressShow = true;
      console.log("Registering user details:", this.registerUserDetails);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registerUserDetails: this.registerUserDetails })
      }).then(r => r.json());
      console.log('Register user response:', response);
      if (response.error) {
        store.state.progressShow = false;
        console.log('Error registering user:', error);
      }
      else {
        var newUser = response.results.user;
        console.log('User registered:', newUser);
        
        

        store.state.accountInfo = response.results.accountInfo;
        store.state.user = newUser;
        
        
        
        //Wait till all the progress is shown      
        var timer = setInterval(() => {
          if(this.progressIndex > this.loginProgress.length - 1){
            console.log('Ending timer, pushing path...')
            clearInterval(timer);
            store.state.progressShow = false;
            // window.location.href = "https://88aab16991194146850432f48779248b.vfs.cloud9.us-west-2.amazonaws.com/#/userDashboard";
            router.push({ path: '/userDashboard' });
          }
        }, 500);

      }
    }
  },
  mounted() {
    console.log('Register mounted');
  },
  created() {
    console.log('Register created');
  }
})

const Redeem = Vue.component('Redeem', {
  template: '#redeem-template',
  data: function() {
    return {
      state: store.state,
      prizes: [
        { name: 'Water Bottle', src: 'https://cdn.shopify.com/s/files/1/1013/4120/products/green_trees_bottle_in_hand_1200x.jpg', price: 2, flex: 3 },
        { name: 'Tote Bag', src: 'https://i3.cpcache.com/merchandise/17_550x550_Front_Color-Khaki.jpg?Size=Medium&AttributeValue=NA&c=True&region={%22name%22:%22FrontCenter%22,%22width%22:10,%22height%22:9,%22alignment%22:%22MiddleCenter%22,%22orientation%22:0,%22dpi%22:100,%22crop_x%22:115,%22crop_y%22:83,%22crop_h%22:956,%22crop_w%22:1000,%22scale%22:0.257,%22template%22:{%22id%22:112388630,%22params%22:{}}}', price: 3, flex: 3 },
        { name: 'Backpack', src: 'https://i.pinimg.com/originals/59/39/4b/59394b0b65f0c72c8647b381299e50fe.jpg', price: 1, flex: 3 },
        { name: 'Solar Powered Battery Pack', src: 'https://cdn.shopify.com/s/files/1/0007/5923/4607/files/Hand_with_product_1024x1024.png', price: 10, flex: 3 },
        { name: 'Hat', src: 'https://i.etsystatic.com/21272414/r/il/776af3/2100373030/il_794xN.2100373030_7sfm.jpg', price: 7, flex: 3 },
        { name: 'Bracelet', src: 'https://i.etsystatic.com/21217717/r/il/b68db2/2066878443/il_794xN.2066878443_nfe1.jpg', price: 10, flex: 3 },
        { name: 'T-shirt', src: 'https://res.cloudinary.com/teepublic/image/private/s--ZMJbXllC--/t_Resized%20Artwork/c_crop,x_10,y_10/c_fit,w_470/c_crop,g_north_west,h_626,w_470,x_0,y_0/g_north_west,u_upload:v1462829024:production:blanks:a59x1cgomgu5lprfjlmi,x_-395,y_-325/b_rgb:eeeeee/c_limit,f_jpg,h_630,q_90,w_630/v1538567882/production/designs/3251950_0.jpg', price: 12, flex: 3 },
        { name: 'Coffee Mug', src: 'https://res.cloudinary.com/teepublic/image/private/s--pYvo4HGO--/c_scale,h_704/c_lpad,g_north_west,h_801,w_1802,x_180,y_48/c_crop,h_801,w_691,x_125/c_mfit,g_north_west,u_misc:Mug%20Effect%20Coffee3%20Left/e_displace,fl_layer_apply,x_14,y_-2/c_mfit,g_north_east,u_misc:Mug%20Effect%20Coffee3%20Right/e_displace,fl_layer_apply,x_-14,y_-2/c_crop,h_801,w_656/g_north_west,l_upload:v1466696262:production:blanks:w00xdkhjelyrnp8i8wxr,x_-410,y_-235/b_rgb:ffffff/c_limit,f_jpg,h_630,q_90,w_630/v1538567882/production/designs/3251950_0.jpg', price: 9, flex: 3 },
        { name: 'Iphone X Case', src: 'https://i.pinimg.com/736x/80/6a/4a/806a4a6ff5794c611f0c0acc2696c255.jpg', price: 6, flex: 3 }
      ],
      selectedPrizes: [],
      snackbar: false,
      text: 'Transaction Completed!',
    }
  },
  computed: {
    total: function () {
      var total = 0;
      for (var i = 0; i < this.selectedPrizes.length; i++) {
        total += this.selectedPrizes[i].price;
      }
      return total;
    },
    checkoutHidden: function () {
      return this.total > 0;
    }
  },
  methods: {
    checkoutPrizes: async function() {
      store.state.progressShow = true;
      // const response = await fetch('/api/checkoutPrizes', {
      //   method: 'POST',
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ total: this.total })
      // }).then(r => r.json());
      
      var accountInfo = await fetch('/api/redeemCarbos/' + this.total).then(r => r.json()); 
      console.log('accountInfo after purchase');


      store.state.accountInfo.carbos = store.state.accountInfo.carbos - this.total;
      
      store.state.progressShow = false;
      this.selectedPrizes = [];
      this.snackbar = true;
      
      
      console.log('store.state.user after purchase is done', store.state.user);


    }
  },
  mounted() {
    console.log('Redeem mounted');
  },
  created() {
    console.log('Redeem created');
  }
})

async function checkAuth(to, from, next) {
  if (!store.state.user) {
    //Check also on server
    var accountInfo = await fetch('/api/getAccountInfo').then(r => r.json()); 
    console.log('store.state.user is missing, lets check on server, accountInfo while doing checkAuth:', accountInfo);
    
    next('/');
  }
  else {
    next();
  }
}

const router = new VueRouter({
  routes: [
    { path: '/welcome', component: Home, alias: '/' },
    { path: '/registerUser', component: RegisterUser },
    { path: '/loginUser', component: LoginUser },
    { path: '/loginGov', component: LoginGov },
    { path: '/userDashboard', component: UserDashboard, beforeEnter: checkAuth },
    { path: '/govDashboard', component: GovDashboard, beforeEnter: checkAuth },
    { path: '/redeem', component: Redeem, beforeEnter: checkAuth },
  ]
})

function initVue() {
  new Vue({
    el: '#app',
    router,
    vuetify: new Vuetify(),
    data: () => ({
      leftDrawer: false,
      state: {}
    }),
    methods: {
      logout: function() {
        fetch('/api/logout')
          .then((response) => {
            store.state.user = undefined;
            router.push({ path: '/' });
          });
      },
      clearDB: function() {
        fetch('/api/clearDB')
          .then((response) => {});
      }
    },
    created: async() => {
      console.log('App created');
      // var data = await init();
      // console.log(data);
      // this.state = data; 
    },
    mounted: async() => {
      console.log('App mounted');
    }
  });
}

async function init() {
  //var fakeList = await fetch('/api/getFakeList').then(r => r.json()); 
  // var data = await fetch('data.json').then(r => r.json());
  //console.log({fakeList})
  //store.state = {...(store.state), fakeList};
  initVue();
  Vue.config.devtools = true;
}

init();
