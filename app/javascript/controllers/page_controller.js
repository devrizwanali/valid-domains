import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['domains', 'domain']
  connect() {
    let _this = this;
    this.fetchDomains();

    setInterval(function() {
      _this.fetchDomains();
    }, 15000)
  }

  domain(e) {
    if (e?.keyCode != 13) return;

    let value = this.domainTarget.value
    if(this.validURL(value)) {
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
    let _this = this;
    fetch('/domains').then(response => response.json()).then(re => {
      this.domainsTarget
      re.forEach(function(domain) {
        _this.addURL(domain.name)
      })
    })
  }

  saveURLInDb(value) {
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
        _this.addURL(res.name)
        _this.domainTarget.value = ''
      });
  }
}
