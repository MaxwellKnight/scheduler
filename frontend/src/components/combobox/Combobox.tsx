import React, { useCallback, useEffect, useState } from 'react';
import { Check, ChevronsUpDown, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth/useAuth";
import axios from "axios";
import { TemplateScheduleData } from '@/types/template.dto';

interface TemplateComboboxProps {
	onTemplateSelect?: (template: TemplateScheduleData | null) => void;
	className?: string;
}

const TemplateCombobox: React.FC<TemplateComboboxProps> = ({
	onTemplateSelect,
	className = "w-[200px]"
}) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [templates, setTemplates] = useState<TemplateScheduleData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

	const fetchTemplates = useCallback(async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('authToken');

			if (!token) {
				throw new Error('Authentication token not found');
			}

			const { data } = await axios.request({
				method: 'GET',
				url: '/templates/team/1',
				baseURL: 'http://localhost:5713',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				params: {
					user_role: user?.user_role
				},
				withCredentials: true
			});

			setTemplates(data);
			setError(null);
		} catch (err) {
			const errorMessage = err instanceof Error ?
				err.message :
				'Failed to load templates';
			setError(errorMessage);
			console.error('Error fetching templates:', err);
		} finally {
			setLoading(false);
		}
	}, [user?.user_role]);

	useEffect(() => {
		if (user?.user_role) {
			fetchTemplates();
		}
	}, [user?.user_role, fetchTemplates]);

	const handleSelect = (currentValue: string) => {
		const newValue = currentValue === value ? "" : currentValue;
		setValue(newValue);
		setOpen(false);

		const selectedTemplate = templates.find(
			template => template.id!.toString() === newValue
		) || null;

		onTemplateSelect?.(selectedTemplate);
	};

	const selectedTemplate = templates.find(
		template => template.id!.toString() === value
	);


	return (
		<div className="space-y-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={`justify-between ${className}`}
						disabled={loading}
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								{selectedTemplate?.name || "Select template..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className={className}>
					<Command>
						<CommandInput placeholder="Search templates..." />
						<CommandList>
							<CommandEmpty>
								{loading ? (
									<div className="flex items-center justify-center p-4">
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Loading...
									</div>
								) : templates.length === 0 ? (
									"No templates available."
								) : (
									"No template found."
								)}
							</CommandEmpty>
							<CommandGroup>
								{templates.map((template) => (
									<CommandItem
										key={template.id}
										value={template.id!.toString()}
										onSelect={handleSelect}
									>
										<Check
											className={`mr-2 h-4 w-4 ${value === template.id!.toString() ? "opacity-100" : "opacity-0"
												}`}
										/>
										{template.name}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
		</div>
	);
};

export default TemplateCombobox;
