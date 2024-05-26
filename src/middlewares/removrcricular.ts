// Ajoutez cette fonction quelque part dans votre code

function removeCircularReferences<T>(key:string, value:T){
    const seen = new WeakSet();

    return function(key: any, value: object | null) {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}
