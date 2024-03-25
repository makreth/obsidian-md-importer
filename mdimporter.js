Hooks.on("renderSidebarTab", async (app, html) => {
    if (app instanceof JournalDirectory) {
        let button = $("<button class='import-md'><i class='fas fa-file-import'></i>Obsidian .md Import</button>");
        button.click(function () {
            new MdImporter().render(true);
        })
        html.find(".directory-footer").append(button);
    }
});

class MdImporter extends FormApplication {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "md-importer";
        options.template = "modules/obsidian-md-importer/mdimporter.html";
        options.classes.push("md-importer");
        options.resizable = false;
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Obsidian .md Importer";
        return options;
    }

    /*
    * JS file schema
    * name: string of name of file
    * path: string of absolute path of file
    * type: string of type, e.g. "text/markdown"
    * webkitRelativePath: string of relative path, including filename at the end of the path.
    * Relative from folder selected by user
    * 
    * Functions
    * text(): grabs the text of a file if it contains text
    * 
    * All folder paths grabbed in Foundry are forward slash paths
    */

    async _updateObject(event, formData) {
        let files = Array.from(await this.element.find("[name=folder-select]")[0].files);
        let pathTextObjects = [];
        for(const file in files){
            let pathTextObject = {};
            pathTextObject.path = file.webkitRelativePath;
            pathTextObject.text = await file.text();
            pathTextObjects.push(pathTextObject);
        }
        pathTextObjects.sort((a,b) => (b.path.match(/\//g) || []).length) - (a.path.match(/\//g) || []).length;

        //TODO: Iterate on pathTextObjects to create documents robustly
        
        let pathObjectMapping = {};
        for(const file of files.values()){
            let parentPaths = MdImporter.extractAllParentPaths(file.webkitRelativePath);
            if(parentPaths === null || parentPaths.length === 0){
                console.error("Extracting parent paths failed");
                return;
            }
            let entryDepth = parentPaths.length - 2;
            let prevParent = null;
            let i = 0;
            for(const path of parentPaths){
                if(path in pathObjectMapping){
                    i++;
                    continue;
                }
                if(i > 0){
                    prevParent = pathObjectMapping[parentPaths[i - 1]];
                }
                if(i < entryDepth){
                        pathObjectMapping[path] = await Folder.create({
                            name : MdImporter.getFileNameFromPath(path),
                            folder: prevParent,
                            type: "JournalEntry"
                        })
                }
                else if(entryDepth == i){
                        pathObjectMapping[path] = await JournalEntry.create({
                            name : MdImporter.getFileNameFromPath(path),
                            folder: prevParent
                        })
                }
                else{
                    pathObjectMapping[path] = await JournalEntryPage.create({
                        name: file.name.split(".")[0],
                        text : {markdown: await file.text(),  format: 2}
                    },
                    {
                        parent: prevParent
                    })
                }
                i++;
            }
        }
        console.log(pathObjectMapping);

    }

    static async createObjects(pathObjectMapping){
        let paths = Object.keys(pathObjectMapping).toSorted(
            (a,b) => (a.match(/\//g) || []).length - (b.match(/\//g) || []).length
        );
        let stringObjectMapping = {
            "Folder" : Folder,
            "JournalEntry" : JournalEntry,
            "JournalEntryPage" : JournalEntryPage
        }
        for (const path of paths){
            let objectToCreate = pathObjectMapping[path];
            let classOfObject = stringObjectMapping[objectToCreate.documentName];
            let createdObject = await classOfObject.create(objectToCreate.toObject());
            console.log(createdObject);
        }
    }

    static extractAllParentPaths(path) {
        if (path === null) {
            return;
        }
        if (typeof path !== "string"){
            return;
        }
        if (typeof path === "string" && path.length === 0) {
            return;
        }

        let current_path = "";
        return path.split("/").map((path_node) => {
            current_path += "/" + path_node;
            return current_path;
        });
    }

    static getFileNameFromPath(path){
        return path.split("/").reverse()[0];
    }
}