import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

const SearchableSelect = ({ options, value, onValueChange, placeholder, searchPlaceholder = "Cerca...", className }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const isAltro = value === "Altro";

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between bg-secondary border-0 text-sm font-normal", !value && "text-muted-foreground", className)}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>Nessun risultato.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onValueChange(option);
                      setOpen(false);
                      if (option !== "Altro") setCustomValue("");
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isAltro && (
        <Input
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onValueChange(`Altro: ${e.target.value}`);
          }}
          placeholder="Inserisci manualmente..."
          className="bg-secondary border-0 text-sm"
        />
      )}
    </div>
  );
};

export default SearchableSelect;
