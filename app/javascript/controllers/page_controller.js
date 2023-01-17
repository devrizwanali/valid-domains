import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['domains', 'domain']
  static values = {
    domainsList: Array,
    syncURLs: Array
  }

  connect() {
    let _this = this;
    this.fetchDomains();

    setInterval(function() {
      _this.fetchDomains();
      _this.syncURLinDB();
    }, 15000)
  }

  domain(e) {
    if (e?.keyCode != 13) return;

    let value = this.domainTarget.value
    if(this.validURL(value)) {
      this.addURL(value)
      this.domainTarget.value = ''
      this.saveURLInDb(value)
    }
  }

  addURL(url) {
    let li = `<li>${url}</li>`
    this.domainsTarget.insertAdjacentHTML("afterbegin", li)
  }


  validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  fetchDomains() {
    if(window.navigator.onLine) {
      let _this = this;
      let urls = [];
      fetch('/domains').then(response => response.json()).then(re => {
        re.forEach(function(domain) {
          if(!(_this.domainsListValue.includes(domain.name)))
            urls.push(domain.name)
        })
        let list = urls.concat(_this.domainsListValue)
        _this.domainsListValue = list

        if(urls.length > 0)
          _this.populateDomains(urls)
      })
    } else console.log("You are offline");
  }

  populateDomains(urls) {
    let _this = this;
    urls.forEach(function(url) {
      _this.addURL(url)
    })
  }

  saveURLInDb(value) {
    if(window.navigator.onLine) {
      let params = {
        name: value
      }
      let _this = this;
      const options = {
        method: 'POST',
        body: JSON.stringify({domain: params}),
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          "Content-Type": "application/json"
        },
      };
      fetch(`/domains.json`, options)
        .then(response => response.json())
        .then(res => {
          let urls = _this.domainsListValue
          if(!urls.includes(res.name))
            urls.push(res.name)
          _this.domainsListValue = urls
        });
      } else {
        let urls = this.syncURLsValue
        if(!urls?.includes(value))
          urls.push(value)
        this.syncURLsValue = urls
        console.log('----offline---', urls)
      }
  }

  syncURLinDB() {
    let _this = this;
    if(window.navigator.onLine && this.syncURLsValue.length > 0) {
      this.syncURLsValue.forEach(function(url) {
        if(!_this.domainsListValue.includes(url)) {
          _this.saveURLInDb(url)
        } else {
          _this.syncURLsValue = _this.syncURLsValue.filter(u => u !== url)
        }
      })
    }
  }
}
