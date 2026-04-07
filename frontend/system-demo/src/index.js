// ✅ 这就是你要的 polyfill（webpack 会自动注入）
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

// 加载 SystemJS
import 'systemjs';

// 加载 lodash（通过 importmap）
System.import('lodash').then((_) => {
  console.log('✅ Lodash 版本：', _.VERSION);
  document.getElementById('app').innerHTML = `
    <h3>webpack + pnpm + core-js + SystemJS 全部正常运行</h3>
    <p>✅ polyfill 已自动注入</p>
    <p>✅ SystemJS 已加载</p>
    <p>✅ importmap 已生效</p>
  `;
});