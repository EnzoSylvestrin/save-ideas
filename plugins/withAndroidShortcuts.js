const {
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAndroidShortcuts = (config) => {
  // Cria os arquivos necessários (shortcuts.xml e strings.xml)
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const packageName = config.android.package || 'com.evalla.saveideas';
      const projectRoot = config.modRequest.platformProjectRoot;
      
      // Cria o arquivo shortcuts.xml
      const shortcutsPath = path.join(
        projectRoot,
        'app/src/main/res/xml/shortcuts.xml'
      );
      const shortcutsDir = path.dirname(shortcutsPath);
      if (!fs.existsSync(shortcutsDir)) {
        fs.mkdirSync(shortcutsDir, { recursive: true });
      }
      
      const shortcutsContent = `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="quick_record"
        android:enabled="true"
        android:icon="@mipmap/ic_launcher"
        android:shortcutShortLabel="@string/shortcut_quick_record_short"
        android:shortcutLongLabel="@string/shortcut_quick_record_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="${packageName}"
            android:data="saveideas://quick-record" />
    </shortcut>
</shortcuts>`;
      
      fs.writeFileSync(shortcutsPath, shortcutsContent, 'utf8');
      
      // Atualiza o arquivo strings.xml
      const stringsPath = path.join(
        projectRoot,
        'app/src/main/res/values/strings.xml'
      );
      
      let stringsContent = '';
      if (fs.existsSync(stringsPath)) {
        stringsContent = fs.readFileSync(stringsPath, 'utf8');
      } else {
        // Cria o arquivo se não existir
        const stringsDir = path.dirname(stringsPath);
        if (!fs.existsSync(stringsDir)) {
          fs.mkdirSync(stringsDir, { recursive: true });
        }
        stringsContent = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>';
      }
      
      // Adiciona as strings se não existirem
      if (!stringsContent.includes('shortcut_quick_record_short')) {
        stringsContent = stringsContent.replace(
          '</resources>',
          '    <string name="shortcut_quick_record_short">Gravar Ideia</string>\n    <string name="shortcut_quick_record_long">Gravar Ideia Rápida</string>\n</resources>'
        );
        fs.writeFileSync(stringsPath, stringsContent, 'utf8');
      }
      
      return config;
    },
  ]);

  // Adiciona a referência no AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const mainApplication = androidManifest.application[0];
    
    // Verifica se já existe a meta-data
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }
    
    const existingMetaData = mainApplication['meta-data'].find(
      (meta) => meta.$['android:name'] === 'android.app.shortcuts'
    );
    
    if (!existingMetaData) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'android.app.shortcuts',
          'android:resource': '@xml/shortcuts',
        },
      });
    }
    
    return config;
  });

  return config;
};

module.exports = withAndroidShortcuts;

