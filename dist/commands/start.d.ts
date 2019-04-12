import PercyCommand from './percy-command';
export default class Start extends PercyCommand {
    static description: string;
    static hidden: boolean;
    static examples: string[];
    static flags: {
        'detached': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'network-idle-timeout': import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
        'port': import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
    };
    run(): Promise<void>;
    private runAttached;
    private runDetached;
}
