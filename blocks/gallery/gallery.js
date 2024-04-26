export default function decorate(block) {
  block.innerHTML = `
    <div id="olapic_block">
      <div id="olapic_specific_widget"></div>
    </div>
  `;

  const olapicBlock = document.getElementById('olapic_block');
  function loadOlapicScript() {
    const olapicIsLoaded = document.querySelectorAll('.olapic-script');
    if (olapicIsLoaded.length > 0) {
      return;
    }
    const olapicScript = document.createElement('script');
    olapicScript.src = 'https://photorankstatics-a.akamaihd.net/743d2e78a76dedeb07e0745158547931/static/frontend/latest/build.min.js';
    olapicScript.setAttribute('data-olapic', 'olapic_specific_widget');
    olapicScript.setAttribute(
      'data-instance',
      '2827c532b51f49bfa3711fdf2445c908',
    );
    olapicScript.setAttribute(
      'data-apikey',
      '1c1b740977981200d49891d310b5be90cce45e09eaa3c0c77115019dd67b3cd2',
    );
    olapicScript.setAttribute('class', 'olapic-script');
    olapicBlock.appendChild(olapicScript);
  }
  const olapicBlockObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadOlapicScript();
        olapicBlockObserver.unobserve(entry.olapicBlock);
      }
    });
  });
  olapicBlockObserver.observe(olapicBlock);
}
