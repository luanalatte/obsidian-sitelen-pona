import '../styles.css';

import { FileView, Plugin } from "obsidian";
import { editorExtension } from './editor';

// interface SitelenPonaSettings {
    
// }

// const DEFAULT_SETTINGS: SitelenPonaSettings = {

// }

export default class SitelenPona extends Plugin {
    // settings: SitelenPonaSettings

    // async setFontScale(scale: number) {
    //     document.documentElement.style.setProperty(
    //         "--sitelen-pona-scale", String(scale) + '%'
    //     );
    // }

    async onload() {
        // await this.loadSettings()

        this.registerEditorExtension(editorExtension)

        this.registerMarkdownPostProcessor((el, ctx) => {
            for (let child of el.findAll('p')) {
                const text = child.innerText.trim();
                if (text.startsWith('!!')) {
                    child.addClass('no-sitelen-pona');
                    child.innerText = text.slice(2).trimStart();
                }
            }
        })

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', leaf => {
                if (!leaf || !(leaf.view instanceof FileView)) return null;
                if (!leaf.view.file) return null;

                const cache = this.app.metadataCache.getFileCache(leaf.view.file);
                if (!cache) return null;

                const classes = cache?.frontmatter?.cssclasses;
                const lang = cache?.frontmatter?.lang;
                if (lang == 'tok' || classes?.includes('sitelen-pona')) {
                    // const views = leaf.view.contentEl.findAll('.markdown-preview-view, .markdown-source-view');
                    // views.forEach(view => {
                    //     view.addClass('sitelen-pona');
                    // });

                    const el = leaf.view.contentEl.find('.cm-content')
                    el.spellcheck = false
                }

                return;
            })
        )

        this.addCommand({
            id: 'toggle-font',
			name: 'Toggle',
			editorCallback(editor, ctx) {
                if (!ctx.file) return;

                ctx.app.fileManager.processFrontMatter(ctx.file, fm => {
                    let classes = fm.cssclasses ?? [];

                    if (typeof classes === "string") {
                        classes = [classes];
                    }

                    if (classes.includes('sitelen-pona')) {
                        fm.cssclasses = classes.filter((c: string) => c != 'sitelen-pona')
                        if (fm.cssclasses.length === 0) {
                            delete fm.cssclasses
                        }
                    } else {
                        classes.push('sitelen-pona')
                        fm.cssclasses = classes
                    }
                }).catch(err => {
                    console.error(err)
                })
            },
        })
    }

    // async loadSettings() {
	// 	this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	// }

	// async saveSettings() {
	// 	await this.saveData(this.settings)
	// }
}