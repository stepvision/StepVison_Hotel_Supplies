import mongoose, { Model, Schema } from 'mongoose';

// Compiles a model, replacing any copy left over from before a hot reload.
// Reusing the old copy would keep validating against the old schema until
// the dev server restarts.
//
// Next.js loads the model files more than once in the same server (page
// rendering, route handlers and server actions are separate copies), so an
// older copy of the model can still be in use. mongoose.deleteModel() is not
// used: it also removes the collection from the connection, and the old copy
// then never gets connected again (its queries fail after 10 seconds, which
// logged admins out). Only the name is freed here, so both copies share the
// same, connected collection.
export function compileModel<T>(name: string, schema: Schema): Model<T> {
    if (mongoose.models[name]) {
        delete mongoose.models[name];
        delete (mongoose.connection.models as Record<string, unknown>)[name];
    }
    // Cast instead of mongoose.model<T>(), whose inferred types exhaust tsc memory.
    return mongoose.model(name, schema) as unknown as Model<T>;
}
