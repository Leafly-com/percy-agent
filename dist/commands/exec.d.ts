import PercyCommand from './percy-command';
export default class Exec extends PercyCommand {
    static description: string;
    static hidden: boolean;
    static strict: boolean;
    static examples: string[];
    static flags: {
        'network-idle-timeout': import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
        'port': import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
    };
    run(): Promise<void>;
}
