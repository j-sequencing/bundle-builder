(function() {
  'use strict';

  var MANDATORY = 'ngds';
  var reports = [
    {id:'ngds',name:'Next-Gen Disease Screen (15,000+ Conditions)'},
    {id:'ai_hc_medication',name:'Medication & Drug Response'},
    {id:'ai_hc_cancer',name:'Cancer Risk Overview'},
    {id:'ai_cs_coloncancer',name:'Colon Cancer'},
    {id:'ai_cs_skincancer',name:'Skin Cancer'},
    {id:'ai_cs_pancreaticcancer',name:'Pancreatic Cancer'},
    {id:'ai_cs_kidneycancer',name:'Kidney Cancer'},
    {id:'ai_cs_thyroidcancer',name:'Thyroid Cancer'},
    {id:'ai_cs_ppgl',name:'Rare Endocrine Cancers'},
    {id:'ai_hc_radiation',name:'Radiation Sensitivity'},
    {id:'ai_hc_connective',name:'Connective Tissue Disorders Overview'},
    {id:'ai_cs_eds',name:'Ehlers-Danlos Report + hEDS Emerging Research'},
    {id:'ai_cs_marfan',name:'Marfan Syndrome'},
    {id:'ai_hc_immune',name:'Immune System Overview'},
    {id:'ai_hc_autoimmune',name:'Autoimmune Disorders'},
    {id:'ai_cs_lupus',name:'Lupus'},
    {id:'ai_hc_brain',name:'Brain and Cognitive Health'},
    {id:'ai_hc_neurological',name:'Neurological Health'},
    {id:'ai_cs_parkinson',name:"Parkinson's Disease"},
    {id:'ai_cs_cmt',name:'Charcot-Marie-Tooth'},
    {id:'ai_cs_mitchell',name:'Mitchell Syndrome'},
    {id:'ai_hc_cardio',name:'Cardiovascular Health'},
    {id:'ai_hc_endocrine',name:'Endocrine Health'},
    {id:'ai_hc_nutrition',name:'Nutritional & Metabolic Health'},
    {id:'ai_hc_growth',name:'Growth & Bone Health'},
    {id:'ai_hc_musculoskeletal',name:'Musculoskeletal Health'},
    {id:'ai_hc_reproductive',name:'Reproductive & Hormonal Health'},
    {id:'ai_hc_pregnancy',name:'Preconception & Pregnancy Planning'},
    {id:'ai_hc_carrier',name:'Carrier Screening'},
    {id:'ai_hc_pediatric',name:'Pediatric Health'},
    {id:'ai_hc_developmental',name:'Developmental Disorders'},
    {id:'ai_hc_digestive',name:'Digestive Disorders'},
    {id:'ai_hc_oral',name:'Oral Health'},
    {id:'ai_hc_skin',name:'Skin Health'},
    {id:'ai_hc_respiratory',name:'Respiratory Health'},
    {id:'ai_hc_vision',name:'Vision Health'},
    {id:'ai_hc_hearing',name:'Hearing & Auditory Genetics'},
    {id:'ai_pr_healthcare',name:'Professional Report: Healthcare Provider'},
    {id:'ai_pr_rheuma',name:'Professional Report: Rheumatologist'},
    {id:'ai_pr_geneticist',name:'Professional Report: Geneticist'},
    {id:'ai_pr_naturopath',name:'Professional Report: Naturopath'},
    {id:'ai_pr_pharmacist',name:'Professional Report: Pharmacist'},
    {id:'ai_pr_surgeon',name:'Professional Report: Surgeon'}
  ];

  var tiers = [
    {min:1,max:10,price:399,slug:'byob-10-reports',expeditedPrice:50,ultraPrice:200},
    {min:11,max:20,price:449,slug:'byob-20-reports',expeditedPrice:50,ultraPrice:200},
    {min:21,max:30,price:609,slug:'byob-30-reports',expeditedPrice:50,ultraPrice:200},
    {min:31,max:999,price:809,slug:'byob-31-plus-reports',expeditedPrice:50,ultraPrice:200}
  ];

  var selectedReports = [MANDATORY];
  var selectedSpeed = 'standard';
  var currentStep = 1;
  var tooltipTimeouts = {};

  function isMobile() { return window.innerWidth <= 600; }

  function getStateFromURL() {
    var p = new URLSearchParams(window.location.search);
    var r = p.get('selected'), s = p.get('speed');
    if (r) {
      var arr = r.split(',').filter(function(id){return id;});
      if (arr.length > 0) {
        if (arr.indexOf(MANDATORY) === -1) arr.unshift(MANDATORY);
        return {selectedReports:arr, selectedSpeed:s||'standard'};
      }
    }
    return null;
  }

  function updateURL() {
    var p = new URLSearchParams(window.location.search);
    p.set('selected', selectedReports.join(','));
    p.set('speed', selectedSpeed);
    window.history.replaceState({}, '', window.location.pathname + '?' + p.toString());
  }

  function getTier() {
    var c = selectedReports.length;
    for (var i=0; i<tiers.length; i++) {
      if (c >= tiers[i].min && c <= tiers[i].max) return tiers[i];
    }
    return null;
  }

  function getSpeedLabel() {
    var labels = {standard:'Standard',expedited:'Expedited',ultra:'Ultra Rapid'};
    return labels[selectedSpeed] + ' Processing';
  }

  function getSpeedPrice(tier) {
    if (selectedSpeed === 'expedited') return tier.expeditedPrice;
    if (selectedSpeed === 'ultra') return tier.ultraPrice;
    return 0;
  }

  function totalPrice() {
    var t = getTier();
    return t ? t.price + getSpeedPrice(t) : 0;
  }

  function updateClearAll() {
    var els = document.querySelectorAll('.bb-clear-all');
    els.forEach(function(el) { el.style.display = selectedReports.length > 1 ? 'block' : 'none'; });
  }

  function updateReportsCount() {
    var el = document.getElementById('bbReportsCount');
    if (el) el.textContent = 'My Reports (' + selectedReports.length + ')';
  }

  function updateSubtotal() {
    var t = getTier();
    var el = document.getElementById('bbSubtotalPrice');
    if (el && t) el.textContent = '$' + t.price;
  }

  function updateCostSummary() {
    var t = getTier();
    var el = document.getElementById('bbCostBreakdown');
    if (!el || !t) return;
    var names = reports.filter(function(r){return selectedReports.indexOf(r.id)!==-1;}).map(function(r){return r.name;});
    var sp = getSpeedPrice(t);
    el.innerHTML = '<div class="bb-cost-item"><span class="bb-cost-label">Reports (' + selectedReports.length + ')</span><span class="bb-cost-value">$' + t.price + '</span></div>' +
      '<ul class="bb-selected-list" id="bbSelectedList">' + names.map(function(n){return '<li>'+n+'</li>';}).join('') + '</ul>' +
      '<div class="bb-cost-item"><span class="bb-cost-label">' + getSpeedLabel() + '</span><span class="bb-cost-value">$' + sp + '</span></div>' +
      '<div class="bb-cost-item"><span class="bb-cost-label">Total</span><span class="bb-cost-value">$' + totalPrice() + '</span></div>';
    updateClearAll();
    var list = document.getElementById('bbSelectedList');
    if (list) setTimeout(function(){list.scrollTop=list.scrollHeight;},50);
  }

    function updateAll() {
      updateURL();
      updateReportsCount();
      updateSubtotal();
      updateCostSummary();
      updateClearAll();
      document.querySelectorAll('.bb-report-card').forEach(function(card) {
        var id = card.getAttribute('data-report-id');
        if (selectedReports.indexOf(id) !== -1) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
      document.querySelectorAll('.bb-speed-option').forEach(function(opt) {
        var spd = opt.getAttribute('data-speed');
        if (spd === selectedSpeed) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
      var totalEl = document.getElementById('bbTotalPrice');
      if (totalEl) totalEl.textContent = '$' + totalPrice();
      var checkoutBtn = document.getElementById('bbCheckout');
      if (checkoutBtn) {
        checkoutBtn.style.opacity = selectedReports.length > 0 ? '1' : '0.5';
        checkoutBtn.style.pointerEvents = selectedReports.length > 0 ? 'auto' : 'none';
      }
    }

    function toggleReport(id) {
      var idx = selectedReports.indexOf(id);
      if (idx === -1) {
        if (id === MANDATORY) return;
        selectedReports.push(id);
      } else {
        if (id === MANDATORY) return;
        selectedReports.splice(idx, 1);
      }
      updateAll();
    }

    function setSpeed(speed) {
      selectedSpeed = speed;
      updateAll();
    }

    function clearAll() {
      selectedReports = [MANDATORY];
      updateAll();
    }

    function renderReports() {
      var container = document.getElementById('bbReportsList');
      if (!container) return;
      container.innerHTML = '';
      reports.forEach(function(r) {
        var card = document.createElement('div');
        card.className = 'bb-report-card' + (selectedReports.indexOf(r.id) !== -1 ? ' selected' : '') + (r.id === MANDATORY ? ' mandatory' : '');
        card.setAttribute('data-report-id', r.id);
        var checkbox = '<div class="bb-checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>';
        var label = '<span class="bb-report-name">' + r.name + '</span>';
        var mandatory = r.id === MANDATORY ? '<span class="bb-mandatory-tag">Included</span>' : '';
        card.innerHTML = checkbox + '<div class="bb-report-info">' + label + mandatory + '</div>';
        if (r.id !== MANDATORY) {
          card.addEventListener('click', function() { toggleReport(r.id); });
        }
        container.appendChild(card);
      });
    }

    function renderSpeedOptions() {
      var container = document.getElementById('bbSpeedOptions');
      if (!container) return;
      var speeds = [{id:'standard',label:'Standard',desc:'4-6 weeks'},{id:'expedited',label:'Expedited',desc:'2-3 weeks'},{id:'ultra',label:'Ultra Rapid',desc:'5-7 days'}];
      container.innerHTML = '';
      speeds.forEach(function(s) {
        var opt = document.createElement('div');
        opt.className = 'bb-speed-option' + (s.id === selectedSpeed ? ' active' : '');
        opt.setAttribute('data-speed', s.id);
        opt.innerHTML = '<div class="bb-speed-label">' + s.label + '</div><div class="bb-speed-desc">' + s.desc + '</div>';
        opt.addEventListener('click', function() { setSpeed(s.id); });
        container.appendChild(opt);
      });
    }

    function init() {
      var state = parseURL();
      selectedReports = state.selectedReports;
      selectedSpeed = state.selectedSpeed;
      renderReports();
      renderSpeedOptions();
      updateAll();
      document.querySelectorAll('.bb-clear-all').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          clearAll();
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
