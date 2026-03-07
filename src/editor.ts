import { EditorView, ViewPlugin, ViewUpdate, PluginValue, DecorationSet, Decoration, PluginSpec } from "@codemirror/view";
import { RangeSetBuilder, Text } from '@codemirror/state';
import { syntaxTree } from "@codemirror/language";

class EditorExtension implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    destroy() {}

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        const tree = syntaxTree(view.state)
        const doc = view.state.doc

        for (let { from, to } of view.visibleRanges) {
            // const text = doc.slice(from, to);

            tree.iterate({
                from,
                to,
                enter(node) {
                    const text = doc.slice(node.from, node.to)

                    for (let i = 1; i <= text.lines; i++) {
                        const line = text.line(i);

                        const m = line.text.match(/^!!\s*(?=\S)/)
                        if (m) {
                            builder.add(line.from, line.from + m[0].length, Decoration.mark({
                                class: 'no-sitelen-pona-indicator'
                            }))

                            builder.add(line.from, line.to + 1, Decoration.mark({
                                class: 'no-sitelen-pona'
                            }))
                        }
                    }
                },
            });
        }

        return builder.finish();
    }
}

const pluginSpec: PluginSpec<EditorExtension> = {
  decorations: (value: EditorExtension) => value.decorations,
};

export const editorExtension = ViewPlugin.fromClass(
  EditorExtension,
  pluginSpec
);
