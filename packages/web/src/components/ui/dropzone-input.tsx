import {
  ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Image as ImageIcon, X } from "lucide-react";
import {
  Accept,
  FileRejection,
  FileWithPath,
  useDropzone,
} from "react-dropzone";
import { Controller, useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { Button } from "./button";

type DropzoneInputProps = Omit<ComponentProps<"input">, "value"> & {
  value: File | undefined;
  name: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
};

export const DropzoneInput = forwardRef<HTMLInputElement, DropzoneInputProps>(
  (
    {
      required,
      disabled = false,
      maxFiles = 1,
      maxSize = 2 * 1000 * 1000,
      accept,
      className,
      ...props
    },
    ref
  ) => {
    const { control, getValues, setValue, watch, setError } = useFormContext();
    const [files, setFiles] = useState<FileWithPath[]>(watch(props.name));

    const onDrop = useCallback(
      <T extends File>(acceptedFiles: T[], rejectedFiles: FileRejection[]) => {
        if (rejectedFiles && rejectedFiles.length > 0) {
          setValue(props.name, []);
          setFiles([]);
          setError(props.name, {
            type: "manual",
            message: rejectedFiles && rejectedFiles[0].errors[0].message,
          });
        } else {
          setFiles(acceptedFiles);
          if (maxFiles > 1) {
            setValue(props.name, acceptedFiles, { shouldValidate: true });
          } else {
            setValue(props.name, acceptedFiles[0], { shouldValidate: true });
          }
        }
      },
      [props.name, setValue, setError, maxFiles]
    );

    useEffect(() => {
      if (getValues(props.name) === undefined) setFiles([]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getValues(props.name)]);

    const removeFile = (index: FileWithPath) => {
      const fileCopy = [...files];
      const removedFile = fileCopy.indexOf(index);
      if (removedFile > -1) {
        fileCopy.splice(removedFile, 1);
      }
      setValue(props.name, fileCopy);
      setFiles(fileCopy);
    };

    const { getRootProps, getInputProps, open } = useDropzone({
      onDrop,
      noClick: true,
      noKeyboard: true,
      maxFiles: maxFiles,
      maxSize: maxSize,
      accept: accept,
    });

    return (
      <>
        {files?.length > 0 ? (
          <div
            className={twMerge(
              "block w-full rounded-md border-0 bg-transparent px-3 py-2 ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50"
            )}
          >
            {files?.map((file, i) => (
              <div key={i} className="flex w-full items-center justify-between">
                <p className="truncate">{file.path}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file)}
                >
                  <X size={20} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Controller
            name={props.name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div
                {...getRootProps()}
                className={twMerge(
                  "block w-full cursor-pointer rounded-md border border-dashed border-border bg-transparent px-6 py-10 ring-0",
                  disabled && "cursor-not-allowed bg-muted opacity-50",
                  className
                )}
                {...field}
                onClick={open}
              >
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon
                    className="mb-5 opacity-80"
                    size={50}
                    strokeWidth={1}
                  />
                  <div>
                    <button type="button" className="text-blue-600">
                      Click here to upload a file
                    </button>{" "}
                    or drag and drop
                  </div>
                  <input
                    id={props.name}
                    disabled={disabled}
                    readOnly={disabled}
                    required={required}
                    ref={ref}
                    {...getInputProps()}
                  />
                </div>
              </div>
            )}
          />
        )}
      </>
    );
  }
);

DropzoneInput.displayName = "DropzoneInput";
