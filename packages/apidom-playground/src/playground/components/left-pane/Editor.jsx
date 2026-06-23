import React from 'react';
import PropTypes from 'prop-types';
import { useSystemSelector, useSystemActionCreatorBound } from 'swagger-adjust';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

const Editor = ({ className }) => {
  const source = useSystemSelector('playground', 'selectSource');
  const setSource = useSystemActionCreatorBound('playground', 'setSource');

  const handleEditorChange = (event) => {
    setSource(event.target.value);
  };

  return (
    <div className={className}>
      <FormControl fullWidth>
        <OutlinedInput
          fullWidth
          multiline
          id="input"
          inputComponent="textarea"
          value={source}
          onChange={handleEditorChange}
          inputProps={{
            style: {
              height: 'calc(100vh - 64px - 190px - 80px)',
              maxHeight: 'calc(100vh - 64px - 190px - 80px)',
              overflow: 'auto',
            },
          }}
        />
      </FormControl>
    </div>
  );
};

Editor.propTypes = {
  className: PropTypes.string,
};

export default Editor;
